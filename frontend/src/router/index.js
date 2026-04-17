import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import HerbList from '@/views/HerbList.vue'
import HerbDetail from '@/views/HerbDetail.vue'

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