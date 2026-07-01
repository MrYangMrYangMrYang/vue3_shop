/**
 * @module router
 * @description 路由配置：路由表、滚动行为、标题设置、登录守卫
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    keepAlive?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('@/views/home.vue'), meta: { title: '首页' } },
  {
    path: '/business/index',
    name: 'BusinessIndex',
    component: () => import('@/views/user/index.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/business/profile',
    name: 'BusinessProfile',
    component: () => import('@/views/user/profile.vue'),
    meta: { title: '资料修改', requiresAuth: true }
  },
  {
    path: '/business/email',
    name: 'BusinessEmail',
    component: () => import('@/views/user/email.vue'),
    meta: { title: '邮箱绑定', requiresAuth: true }
  },
  {
    path: '/product/list',
    name: 'ProductList',
    component: () => import('@/views/product/list.vue'),
    meta: { title: '商品列表', keepAlive: true }
  },
  {
    path: '/product/info',
    name: 'ProductInfo',
    component: () => import('@/views/product/info.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/business/address/index',
    name: 'AddressIndex',
    component: () => import('@/views/user/address/index.vue'),
    meta: { title: '地址管理', requiresAuth: true }
  },
  {
    path: '/business/address/add',
    name: 'AddressAdd',
    component: () => import('@/views/user/address/add.vue'),
    meta: { title: '新增地址', requiresAuth: true }
  },
  {
    path: '/business/address/edit',
    name: 'AddressEdit',
    component: () => import('@/views/user/address/edit.vue'),
    meta: { title: '编辑地址', requiresAuth: true }
  },
  {
    path: '/cart/index',
    name: 'CartIndex',
    component: () => import('@/views/cart/index.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/cart/confirm',
    name: 'CartConfirm',
    component: () => import('@/views/cart/confirm.vue'),
    meta: { title: '确认订单', requiresAuth: true }
  },
  {
    path: '/order/index',
    name: 'OrderIndex',
    component: () => import('@/views/order/index.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/order/express',
    name: 'OrderExpress',
    component: () => import('@/views/order/express.vue'),
    meta: { title: '物流追踪', requiresAuth: true }
  },
  {
    path: '/order/info',
    name: 'OrderInfo',
    component: () => import('@/views/order/info.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/order/evaluate',
    name: 'OrderEvaluate',
    component: () => import('@/views/order/evaluate.vue'),
    meta: { title: '发表评价', requiresAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register.vue'),
    meta: { title: '注册' }
  },
  { path: '/login', name: 'Login', component: () => import('@/views/login.vue'), meta: { title: '登录' } },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // 浏览器前进/后退时恢复原滚动位置，其余情况回到顶部
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

const BASE_TITLE = 'VueShop'

/** 动态设置页面标题 */
router.afterEach(to => {
  const title = to.meta?.title
  document.title = title ? `${title} - ${BASE_TITLE}` : BASE_TITLE
})

/** 全局路由守卫：登录校验，未登录携带 redirect 跳登录页 */
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  const isLoggedIn = await userStore.checkLogin()
  if (!isLoggedIn) {
    showFailToast({ message: '请先登录', duration: 1000 })
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
