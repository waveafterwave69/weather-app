import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../pages/AuthPage.vue'),
  },
  {
    path: '/main',
    component: () => import('../pages/MainPage.vue'),
  },
  {
    path: '/profile',
    component: () => import('pages/ProfilePage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
