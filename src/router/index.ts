import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/',
      name: 'preview',
      component: () => import('@/views/preview/index.vue'),
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('@/views/play/index.vue'),
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('@/views/record/index.vue'),
    },
    {
      path: '/record-play',
      name: 'recordPlay',
      component: () => import('@/views/record-play/index.vue'),
    },
    {
      path: '/my',
      name: 'my',
      component: () => import('@/views/my/index.vue'),
    },
  ],
})

export default router
