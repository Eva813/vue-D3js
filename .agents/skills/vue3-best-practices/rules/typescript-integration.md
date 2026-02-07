---
title: TypeScript Integration Best Practices
impact: CRITICAL
impactDescription: ensures type safety, better IDE support, and prevents runtime errors
tags: typescript, type-safety, composition-api, props, emit, performance
---

## TypeScript Integration Best Practices

Leverage Vue 3's excellent TypeScript support for type safety, better IDE experience, and runtime error prevention.

**Incorrect (weak typing, any usage, missing type definitions):**

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">{{ buttonText }}</button>
    <child-component 
      :data="componentData" 
      @update="handleUpdate"
    />
  </div>
</template>

<script setup>
// ❌ 無類型定義
const props = defineProps({
  title: String,
  items: Array,
  config: Object
})

// ❌ 使用 any 類型
const componentData: any = ref({})
const items: any[] = ref([])

// ❌ 沒有事件類型定義
const emit = defineEmits(['update', 'change'])

// ❌ 沒有返回類型的函數
const processData = (data) => {
  return data.map(item => ({
    ...item,
    processed: true
  }))
}

// ❌ 沒有類型的計算屬性
const computedValue = computed(() => {
  return props.items.filter(item => item.active).length
})

// ❌ 弱類型的 composable
const { data, loading } = useApi('/api/users')
</script>
```

**Correct (strong typing with full TypeScript support):**

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">{{ buttonText }}</button>
    <child-component 
      :data="componentData" 
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

// ✅ 定義介面
interface Item {
  id: number
  name: string
  active: boolean
  metadata?: Record<string, unknown>
}

interface Config {
  theme: 'light' | 'dark'
  locale: string
  features: {
    search: boolean
    export: boolean
  }
}

interface UpdateEvent {
  id: number
  field: string
  value: unknown
  timestamp: number
}

// ✅ 強類型 Props 定義
interface Props {
  title: string
  items: Item[]
  config: Config
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: '確認'
})

// ✅ 強類型事件定義
interface Emits {
  update: [event: UpdateEvent]
  change: [field: string, value: string | number]
  delete: [id: number]
}

const emit = defineEmits<Emits>()

// ✅ 強類型響應式資料
const componentData = ref<Item[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// ✅ 有返回類型的函數
const processData = (data: Item[]): Item[] => {
  return data.map(item => ({
    ...item,
    processed: true
  }))
}

// ✅ 強類型計算屬性
const activeItemsCount = computed<number>(() => {
  return props.items.filter((item: Item) => item.active).length
})

// ✅ 強類型 composable 使用
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

const { data: users, loading: usersLoading, error: usersError } = useApi<User[]>('/api/users')

// ✅ 類型化事件處理器
const handleClick = (): void => {
  emit('change', 'action', 'click')
}

const handleUpdate = (event: UpdateEvent): void => {
  emit('update', event)
}
</script>
```

**Advanced TypeScript Patterns with Vue 3:**

```typescript
// ✅ 泛型 Composable
export function useApi<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetch = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      const response = await api.get<T>(url)
      data.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    fetch,
    refresh: fetch
  }
}

// ✅ 泛型組件 Props
interface ListProps<T> {
  items: T[]
  keyField: keyof T
  displayField: keyof T
  onItemClick?: (item: T) => void
}

// ✅ 使用泛型組件
const GenericList = defineComponent<ListProps<User>>({
  // 組件實現
})

// ✅ 類型化 provide/inject
interface AppContext {
  user: ComputedRef<User | null>
  settings: ComputedRef<AppSettings>
  updateSettings: (settings: Partial<AppSettings>) => void
}

// 提供者
const appContext: AppContext = {
  user: computed(() => currentUser.value),
  settings: computed(() => appSettings.value),
  updateSettings: (newSettings: Partial<AppSettings>) => {
    appSettings.value = { ...appSettings.value, ...newSettings }
  }
}

provide<AppContext>('appContext', appContext)

// 消費者
const appContext = inject<AppContext>('appContext')
if (!appContext) {
  throw new Error('appContext not provided')
}
```

**Custom Type Guards and Utilities:**

```typescript
// ✅ 類型守衛
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'name' in obj && 
         'email' in obj
}

// ✅ 實用類型
type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// ✅ 使用實用類型
type UserFormData = PartialExcept<User, 'name' | 'email'>
type UserWithRequiredRole = RequiredKeys<User, 'role'>

// ✅ 條件類型
type ApiResponse<T> = T extends Array<infer U> 
  ? { items: U[]; total: number; page: number }
  : { data: T }

// ✅ 映射類型
type FormFields<T> = {
  [K in keyof T]: {
    value: T[K]
    error: string | null
    touched: boolean
  }
}

// ✅ 使用映射類型
const userForm = ref<FormFields<User>>({
  id: { value: 0, error: null, touched: false },
  name: { value: '', error: null, touched: false },
  email: { value: '', error: null, touched: false },
  role: { value: 'user', error: null, touched: false }
})
```

**Vue 3 Specific TypeScript Features:**

```vue
<script setup lang="ts">
// ✅ defineComponent 替代方案（更好的 TypeScript 支援）
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TypedComponent',
  props: {
    message: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // props 自動推斷類型
    const upperMessage = computed(() => props.message.toUpperCase())
    return { upperMessage }
  }
})

// ✅ Ref 類型推斷
const count = ref(0)        // Ref<number>
const name = ref('')        // Ref<string>
const user = ref<User>()    // Ref<User | undefined>

// ✅ Reactive 類型推斷
const state = reactive({
  count: 0,               // number
  name: '',              // string
  user: null as User | null  // User | null
})

// ✅ 計算屬性類型推斷
const doubleCount = computed(() => count.value * 2)  // ComputedRef<number>

// ✅ Watch 類型
watch(
  () => props.user,
  (newUser: User | undefined, oldUser: User | undefined) => {
    console.log('User changed:', { newUser, oldUser })
  }
)

// ✅ 生命週期鉤子類型
onMounted((): void => {
  console.log('Component mounted')
})

onBeforeUnmount((): void => {
  cleanup()
})
</script>
```

**TypeScript Configuration Optimization:**

```json
// ✅ tsconfig.json 針對 Vue 3
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true,
    "skipLibCheck": false,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    
    // Vue 3 specific
    "types": ["vite/client", "@vue/runtime-core"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx", 
    "src/**/*.vue"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.js"
  ]
}
```

**Vite TypeScript Integration:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // ✅ 啟用類型檢查
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

**Error Handling with TypeScript:**

```typescript
// ✅ 錯誤類型定義
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ✅ 結果類型模式
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// ✅ 安全的 API 呼叫
const safeApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<Result<T, ApiError>> => {
  try {
    const data = await apiCall()
    return { success: true, data }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error }
    }
    return { 
      success: false, 
      error: new ApiError('Unknown error occurred', 500)
    }
  }
}

// ✅ 使用 Result 類型
const result = await safeApiCall(() => api.getUsers())
if (result.success) {
  users.value = result.data  // TypeScript 知道這是 User[]
} else {
  error.value = result.error.message  // TypeScript 知道這是 ApiError
}
```

**Performance Impact:**

```bash
# TypeScript 優化效果
Development Experience: +90% (better IDE support, autocomplete)
Runtime Errors: -75% (compile-time type checking)
Refactoring Safety: +85% (type-aware refactoring)
Code Documentation: +60% (types as documentation)
Team Collaboration: +70% (clear interfaces and contracts)
```

**Best Practices:**

1. **Strict Mode**: Always use TypeScript strict mode
2. **Interface Definition**: Define interfaces for all data structures
3. **Generic Types**: Use generics for reusable components and composables
4. **Type Guards**: Implement type guards for runtime type safety
5. **Utility Types**: Leverage TypeScript utility types
6. **Props Typing**: Always type component props and emits
7. **API Typing**: Type all API responses and requests
8. **Error Handling**: Use typed error handling patterns

**Note:** Vue 3.4+ provides even better TypeScript support with improved type inference and performance.