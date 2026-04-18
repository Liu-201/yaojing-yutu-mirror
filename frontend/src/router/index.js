import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import HerbList from '@/views/HerbList.vue'
import HerbDetail from '@/views/HerbDetail.vue'
import MapPage from '@/views/MapPage.vue'
import TimeSpace from '@/views/TimeSpace.vue'
import AIQuestion from '@/views/AIQuestion.vue'
import TraceCode from '@/views/TraceCode.vue'
import UserCenter from '@/views/UserCenter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/herbs',
    name: 'HerbList',
    component: HerbList
  },
  {
    path: '/herbs/:id',
    name: 'HerbDetail',
    component: HerbDetail
  },
  {
    path: '/map',
    name: 'Map',
    component: MapPage
  },
  {
    path: '/timespace',
    name: 'TimeSpace',
    component: TimeSpace
  },
  {
    path: '/ai',
    name: 'AIQuestion',
    component: AIQuestion
  },
  {
    path: '/trace',
    name: 'TraceCode',
    component: TraceCode
  },
  {
    path: '/user',
    redirect: '/user/profile'
  },
  {
    path: '/user/:tab(profile|favorites|history)',
    name: 'UserCenter',
    component: UserCenter
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 需要登录才能访问的页面路径（支持字符串精确匹配和正则表达式）
const protectedRoutes = [
  { pattern: /^\/herbs\/\d+$/, name: 'herb-detail' },  // 药材详情页
  { pattern: /^\/ai$/, name: 'ai-question' },          // AI问药页
  { pattern: /^\/user/, name: 'user-center' }          // 用户中心及其子页面
]

// 全局前置守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const protectedPaths = [
    { pattern: /^\/herbs\/\d+$/, requiresAuth: true },
    { path: '/ai', requiresAuth: true }
  ]
  const requiresAuth = protectedPaths.some(rule => {
    if (rule.pattern) return rule.pattern.test(to.path)
    if (rule.path) return to.path === rule.path
    return false
  })
  if (requiresAuth && !userStore.isLoggedIn) {
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    window.dispatchEvent(new CustomEvent('open-auth-modal'))
    next(false)
    return
  }
  next()
})

export default router