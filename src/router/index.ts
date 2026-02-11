import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首頁'
    }
  },
  {
    path: '/insurance-agents',
    name: 'insurance-agents',
    component: () => import('@/views/InsuranceAgentView.vue'),
    meta: {
      title: '產險業務員保單績效'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 設定頁面標題
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} | Vue 3 + D3.js`
  }
  next()
})

export default router
