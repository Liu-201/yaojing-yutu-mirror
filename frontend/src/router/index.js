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

// 需要登录才能访问的页面路径前缀
const protectedRoutes = ['/user', '/user/profile', '/user/favorites', '/user/history']

// 全局前置守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const isProtected = protectedRoutes.some(route => to.path.startsWith(route))
  if (isProtected) {
    const userStr = localStorage.getItem('yaojing_user')
    if (!userStr) {
      // 未登录，触发全局事件打开登录弹窗
      window.dispatchEvent(new CustomEvent('open-auth-modal'))
      next({ path: '/' })
      return
    }
  }
  next()
})

export default router