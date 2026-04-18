import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import HerbList from '@/views/HerbList.vue'
import HerbDetail from '@/views/HerbDetail.vue'
import MapPage from '@/views/MapPage.vue'
import TimeSpace from '@/views/TimeSpace.vue'
import AIQuestion from '@/views/AIQuestion.vue'
import TraceCode from '@/views/TraceCode.vue'
import UserCenter from '@/views/UserCenter.vue'
import { useUserStore } from '@/stores/userStore'

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

// 全局前置守卫：只对 /user 开头的路径检查登录状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 判断是否以 /user 开头（个人中心相关页面）
  const isUserPage = to.path.startsWith('/user')
  if (isUserPage && !userStore.isLoggedIn) {
    // 保存目标路径，登录后跳转
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    // 触发登录弹窗
    window.dispatchEvent(new CustomEvent('open-auth-modal'))
    // 阻止导航，不跳转
    next(false)
    return
  }
  // 其他页面直接放行
  next()
})

export default router