## Standards  標準
MUST FOLLOW THESE RULES, NO EXCEPTIONS
- Stack: Vue.js, TypeScript, Vue Router, Pinia, D3.js
- Patterns: ALWAYS use Composition API + <script setup>, NEVER use Options API
- ALWAYS Keep types alongside your code, use TypeScript for type safety, prefer interface over type for defining types
- Keep unit and integration tests alongside the file they test: src/ui/Button.vue + src/ui/Button.spec.ts
- ONLY add meaningful comments that explain why something is done, not what it does
- ALWAYS use named functions when declaring methods, use arrow functions only for callbacks
- ALWAYS prefer named exports over default exports

### 改成 named function 的情況：

你直接定義的方法/函數
會在 template 中調用的方法
事件處理函數（event handlers）

### 保持 arrow function 的情況：

傳給其他函數的 callback
Vue API 的參數（computed, watch, onMounted 等）
Promise 的 then/catch
Array methods（map, filter, forEach 等）
setTimeout/setInterval 的 callback

這樣改主要是為了代碼的可讀性和 debugging 時更容易追蹤

## Vue Components Best Practices
- Name files consistently using PascalCase (UserProfile.vue, DataChart.vue).
- Use the Composition API with `<script setup>` for all new components.
- Define component props with explicit TypeScript types and default values.
- ALWAYS use PascalCase for component names in source code
- ALWAYS define props with defineProps<{ propOne: number }>() and TypeScript types, WITHOUT const props =
- Use const props = ONLY if props are used in the script block
- Destructure props to declare default values
- ALWAYS define emits with const emit = defineEmits<{ eventName: [argOne: type]; otherEvent: [] }>() for type safety

- ALWAYS use camelCase in JS for props and emits, even if they are kebab-case in templates
- ALWAYS use kebab-case in templates for props and emits
- ALWAYS use the prop shorthand if possible: <MyComponent :count /> instead of <MyComponent :count="count" /> (value has the same name as the prop)
- ALWAYS Use the shorthand for slots: <template #default> instead of <template v-slot:default>
- ALWAYS use explicit <template> tags for ALL used slots
- ALWAYS use defineModel<type>({ required, get, set, default }) to define allowed v-model bindings in components. This avoids defining modelValue prop and update:modelValue event manually

### Examples
defineModel()

```vue
<script setup lang="ts">
// ✅ Simple two-way binding for modelvalue
const title = defineModel<string>()

// ✅ With options and modifiers
const [title, modifiers] = defineModel<string>({
  default: 'default value',
  required: true,
  get: (value) => value.trim(), // transform value before binding
  set: (value) => {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  },
})
</script>
```

Multiple Models
By default defineModel() assumes a prop named modelValue but if we want to define multiple v-model bindings, we need to give them explicit names:

```vue
<script setup lang="ts">
// ✅ Multiple v-model bindings
const firstName = defineModel<string>('firstName')
const age = defineModel<number>('age')
</script>

```

They can be used in the template like this:

```vue
<UserForm v-model:first-name="user.firstName" v-model:age="user.age" />
```


## Modifiers & Transformations
Native elements v-model has built-in modifiers like .lazy, .number, and .trim. We can implement similar functionality in components, fetch and read https://vuejs.org/guide/components/v-model.md#handling-v-model-modifiers if the user needs that.