import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import HerbList from '@/views/HerbList.vue'
import HerbDetail from '@/views/HerbDetail.vue'
import MapPage from '@/views/MapPage.vue'
import TimeSpace from '@/views/TimeSpace.vue'
import AIQuestion from '@/views/AIQuestion.vue'
import TraceCode from '@/views/TraceCode.vue'

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
  name: 'UserCenter',
  component: () => import('@/views/UserCenter.vue')
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


export default router