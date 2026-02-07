---
title: Vue 3 Testing Best Practices
impact: HIGH
impactDescription: ensures code reliability, prevents regressions, and improves maintainability
tags: testing, vitest, vue-test-utils, unit-testing, integration-testing, e2e
---

## Vue 3 Testing Best Practices

Implement comprehensive testing strategies for Vue 3 applications using modern tools and patterns.

**Incorrect (weak testing, no isolation, brittle tests):**

```javascript
// ❌ 脆弱的測試，依賴實現細節
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  it('should work', async () => {
    // ❌ 沒有 setup
    const wrapper = mount(UserProfile, {
      props: { userId: 1 }
    })

    // ❌ 依賴內部實現
    expect(wrapper.vm.user).toBeDefined()
    expect(wrapper.vm.loading).toBe(false)
    
    // ❌ 直接操作 Vue 實例
    wrapper.vm.fetchUser()
    
    // ❌ 沒有等待異步操作
    expect(wrapper.text()).toContain('John Doe')
    
    // ❌ 測試實現而非行為
    expect(wrapper.find('.user-name').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Edit')
  })
})

// ❌ 沒有 mock 的 API 測試
describe('API calls', () => {
  it('fetches user data', async () => {
    // ❌ 真實的 API 調用
    const response = await api.getUser(1)
    expect(response.data.name).toBe('John Doe')
  })
})
```

**Correct (robust testing with proper setup and patterns):**

```typescript
// ✅ 完整的單元測試設置
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UserProfile from '@/components/UserProfile.vue'
import type { User } from '@/types'

// ✅ Mock API 模組
vi.mock('@/services/api', () => ({
  userApi: {
    getUser: vi.fn(),
    updateUser: vi.fn()
  }
}))

import { userApi } from '@/services/api'

describe('UserProfile', () => {
  let wrapper: VueWrapper
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  }

  beforeEach(() => {
    // ✅ 重置所有 mocks
    vi.clearAllMocks()
    
    // ✅ 設置測試環境
    wrapper = mount(UserProfile, {
      props: { userId: 1 },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { user: mockUser, isAuthenticated: true }
            }
          })
        ],
        stubs: {
          // ✅ Stub 不相關的組件
          'router-link': true,
          'notification-component': true
        }
      }
    })
  })

  describe('組件初始化', () => {
    it('應該正確顯示用戶資訊', async () => {
      // ✅ Mock API 響應
      (userApi.getUser as MockedFunction<typeof userApi.getUser>)
        .mockResolvedValue({ data: mockUser })

      // ✅ 觸發組件掛載
      await wrapper.vm.$nextTick()

      // ✅ 測試用戶行為而非實現
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('john@example.com')
      
      // ✅ 使用 data-testid 而非 CSS 選擇器
      expect(wrapper.find('[data-testid="user-name"]').text()).toBe('John Doe')
      expect(wrapper.find('[data-testid="user-email"]').text()).toBe('john@example.com')
    })

    it('載入狀態應該正確顯示', async () => {
      // ✅ Mock 延遲的 API 響應
      const mockPromise = new Promise(resolve => 
        setTimeout(() => resolve({ data: mockUser }), 100)
      );
      
      (userApi.getUser as MockedFunction<typeof userApi.getUser>)
        .mockReturnValue(mockPromise)

      // ✅ 檢查載入狀態
      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="user-content"]').exists()).toBe(false)

      // ✅ 等待異步完成
      await mockPromise
      await wrapper.vm.$nextTick()

      // ✅ 檢查載入完成狀態
      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="user-content"]').exists()).toBe(true)
    })
  })

  describe('用戶互動', () => {
    it('點擊編輯按鈕應該切換到編輯模式', async () => {
      // ✅ 設置初始狀態
      (userApi.getUser as MockedFunction<typeof userApi.getUser>)
        .mockResolvedValue({ data: mockUser })
      await wrapper.vm.$nextTick()

      // ✅ 模擬用戶點擊
      await wrapper.find('[data-testid="edit-button"]').trigger('click')

      // ✅ 驗證狀態變化
      expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(false)
    })

    it('表單提交應該調用 API 並顯示成功訊息', async () => {
      // ✅ Mock 更新 API
      (userApi.updateUser as MockedFunction<typeof userApi.updateUser>)
        .mockResolvedValue({ data: { ...mockUser, name: 'Jane Doe' } })

      // ✅ 進入編輯模式
      await wrapper.find('[data-testid="edit-button"]').trigger('click')

      // ✅ 填寫表單
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('Jane Doe')

      // ✅ 提交表單
      await wrapper.find('[data-testid="save-button"]').trigger('click')

      // ✅ 驗證 API 調用
      expect(userApi.updateUser).toHaveBeenCalledWith(1, {
        name: 'Jane Doe'
      })

      // ✅ 等待 DOM 更新
      await wrapper.vm.$nextTick()

      // ✅ 驗證成功狀態
      expect(wrapper.find('[data-testid="success-message"]').text())
        .toContain('更新成功')
    })
  })

  describe('錯誤處理', () => {
    it('API 錯誤應該顯示錯誤訊息', async () => {
      // ✅ Mock API 錯誤
      (userApi.getUser as MockedFunction<typeof userApi.getUser>)
        .mockRejectedValue(new Error('Network error'))

      // ✅ 觸發組件掛載
      await wrapper.vm.$nextTick()

      // ✅ 等待錯誤處理
      await new Promise(resolve => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      // ✅ 驗證錯誤顯示
      expect(wrapper.find('[data-testid="error-message"]').text())
        .toContain('載入失敗')
    })
  })
})
```

**Composable Testing Patterns:**

```typescript
// ✅ 測試 Composable
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'

describe('useAsyncData', () => {
  const mockApiCall = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應該正確處理成功的 API 調用', async () => {
    // ✅ 設置 mock
    const mockData = { id: 1, name: 'Test' }
    mockApiCall.mockResolvedValue(mockData)

    // ✅ 使用 composable
    const { data, loading, error, execute } = useAsyncData(mockApiCall)

    // ✅ 初始狀態驗證
    expect(data.value).toBe(null)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)

    // ✅ 執行並等待結果
    const promise = execute()
    
    // ✅ 載入狀態驗證
    expect(loading.value).toBe(true)
    
    await promise

    // ✅ 成功狀態驗證
    expect(data.value).toEqual(mockData)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('應該正確處理 API 錯誤', async () => {
    // ✅ 設置錯誤 mock
    const mockError = new Error('API Error')
    mockApiCall.mockRejectedValue(mockError)

    const { data, loading, error, execute } = useAsyncData(mockApiCall)

    // ✅ 執行並處理錯誤
    try {
      await execute()
    } catch (e) {
      // 預期的錯誤
    }

    // ✅ 錯誤狀態驗證
    expect(data.value).toBe(null)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(mockError)
  })
})
```

**Store Testing Patterns:**

```typescript
// ✅ 測試 Pinia Store
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      const userStore = useUserStore()
      
      expect(userStore.user).toBe(null)
      expect(userStore.users).toEqual([])
      expect(userStore.loading).toBe(false)
      expect(userStore.isAuthenticated).toBe(false)
    })
  })

  describe('Actions', () => {
    it('登入成功應該更新用戶狀態', async () => {
      const userStore = useUserStore()
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
      
      // ✅ Mock API
      vi.mocked(authApi.login).mockResolvedValue({
        user: mockUser,
        token: 'test-token'
      })

      // ✅ 執行 action
      await userStore.login({ email: 'test@example.com', password: 'password' })

      // ✅ 驗證狀態變化
      expect(userStore.user).toEqual(mockUser)
      expect(userStore.isAuthenticated).toBe(true)
      expect(userStore.loading).toBe(false)
    })

    it('登入失敗應該保持未認證狀態', async () => {
      const userStore = useUserStore()
      
      // ✅ Mock API 錯誤
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

      // ✅ 執行 action 並捕獲錯誤
      await expect(userStore.login({ 
        email: 'wrong@example.com', 
        password: 'wrong' 
      })).rejects.toThrow('Invalid credentials')

      // ✅ 驗證狀態未改變
      expect(userStore.user).toBe(null)
      expect(userStore.isAuthenticated).toBe(false)
    })
  })

  describe('Getters', () => {
    it('activeUsers 應該過濾活躍用戶', () => {
      const userStore = useUserStore()
      
      // ✅ 設置測試數據
      userStore.users = [
        { id: 1, name: 'Active User', active: true },
        { id: 2, name: 'Inactive User', active: false },
        { id: 3, name: 'Another Active', active: true }
      ]

      // ✅ 驗證 getter
      expect(userStore.activeUsers).toHaveLength(2)
      expect(userStore.activeUsers.every(user => user.active)).toBe(true)
    })
  })
})
```

**Integration Testing:**

```typescript
// ✅ 整合測試
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import UserDashboard from '@/views/UserDashboard.vue'

describe('User Dashboard Integration', () => {
  it('應該正確載入和顯示用戶儀表板', async () => {
    // ✅ 設置路由
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/dashboard', component: UserDashboard }
      ]
    })

    // ✅ 設置測試數據
    const mockUsers = [
      { id: 1, name: 'User 1', active: true },
      { id: 2, name: 'User 2', active: false }
    ]

    // ✅ Mock API
    vi.mocked(usersApi.getAll).mockResolvedValue({ data: mockUsers })

    // ✅ 掛載組件
    const wrapper = mount(UserDashboard, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { isAuthenticated: true },
              users: { users: mockUsers }
            }
          })
        ]
      }
    })

    // ✅ 等待異步載入
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // ✅ 驗證整合功能
    expect(wrapper.find('[data-testid="user-count"]').text()).toBe('2')
    expect(wrapper.find('[data-testid="active-users"]').text()).toBe('1')
    expect(wrapper.findAll('[data-testid="user-item"]')).toHaveLength(2)
  })
})
```

**E2E Testing Setup:**

```typescript
// ✅ Playwright E2E 測試
// tests/e2e/user-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // ✅ 設置測試環境
    await page.goto('/login')
    
    // ✅ 登入
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // ✅ 等待導航完成
    await page.waitForURL('/dashboard')
  })

  test('應該能夠創建、編輯和刪除用戶', async ({ page }) => {
    // ✅ 導航到用戶頁面
    await page.click('[data-testid="users-nav"]')
    await page.waitForURL('/users')

    // ✅ 創建新用戶
    await page.click('[data-testid="add-user-button"]')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="save-button"]')

    // ✅ 驗證用戶已創建
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('text=Test User')).toBeVisible()

    // ✅ 編輯用戶
    await page.click('[data-testid="edit-user-1"]')
    await page.fill('[data-testid="name-input"]', 'Updated Test User')
    await page.click('[data-testid="save-button"]')

    // ✅ 驗證更新
    await expect(page.locator('text=Updated Test User')).toBeVisible()

    // ✅ 刪除用戶
    await page.click('[data-testid="delete-user-1"]')
    await page.click('[data-testid="confirm-delete"]')

    // ✅ 驗證刪除
    await expect(page.locator('text=Updated Test User')).not.toBeVisible()
  })
})
```

**Test Utilities and Helpers:**

```typescript
// ✅ 測試工具函數
// tests/utils/testing-helpers.ts
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  active: true,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createMockWrapper = (
  component: any,
  options: {
    props?: Record<string, any>
    storeState?: Record<string, any>
    mocks?: Record<string, any>
  } = {}
) => {
  return mount(component, {
    props: options.props,
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: options.storeState
        })
      ],
      mocks: options.mocks,
      stubs: {
        'router-link': true,
        'transition': false,
        'teleport': true
      }
    }
  })
}

export const waitForAsyncComponent = async (wrapper: VueWrapper) => {
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await wrapper.vm.$nextTick()
}
```

**Testing Configuration:**

```typescript
// ✅ Vitest 配置
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/main.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
})

// tests/setup.ts
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// ✅ 全局測試設置
config.global.stubs = {
  'router-link': true,
  'router-view': true,
  transition: false
}

// ✅ Mock 全局對象
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})
```

**Best Practices:**

1. **Test Behavior, Not Implementation**: Focus on user interactions and outcomes
2. **Use Data Test IDs**: Avoid brittle CSS selectors for test targeting
3. **Mock External Dependencies**: Isolate units under test
4. **Async Handling**: Properly handle async operations and DOM updates
5. **Setup and Teardown**: Reset state between tests
6. **Meaningful Test Names**: Use descriptive test descriptions
7. **Coverage Goals**: Aim for high coverage of critical paths
8. **E2E for User Flows**: Test complete user journeys with E2E tests

**Performance Impact:**

```bash
# Testing benefits
Bug Detection: +85% (catch issues before production)
Refactoring Confidence: +90% (safe code changes)
Development Speed: +40% (faster debugging and validation)
Code Quality: +60% (better architecture through testability)
Maintenance Cost: -50% (easier to maintain tested code)
```

**Note:** Comprehensive testing is crucial for Vue 3 applications, providing confidence in code changes and preventing regressions in production.