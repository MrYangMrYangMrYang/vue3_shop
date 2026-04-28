import { createRouter, createWebHistory } from 'vue-router'
import { showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'

import home from '@/components/home.vue'
import BusinessIndex from '@/components/business/index.vue'
import CartIndex from '@/components/cart/index.vue'

const login = () => import('@/components/login.vue')
const register = () => import('@/components/register.vue')
const BusinessProfile = () => import('@/components/business/profile.vue')
const BusinessEmail = () => import('@/components/business/email.vue')
const ProductList = () => import('@/components/product/list.vue')
const ProductInfo = () => import('@/components/product/info.vue')
const AddressIndex = () => import('@/components/business/address/index.vue')
const AddressAdd = () => import('@/components/business/address/add.vue')
const AddressEdit = () => import('@/components/business/address/edit.vue')
const CartConfirm = () => import('@/components/cart/confirm.vue')
const OrderIndex = () => import('@/components/order/index.vue')
const OrderExpress = () => import('@/components/order/express.vue')
const OrderInfo = () => import('@/components/order/info.vue')
const OrderEveluate = () => import('@/components/order/eveluate.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: home },
    { path: '/business/index', name: 'BusinessIndex', component: BusinessIndex, meta: { IsLogin: true } },
    { path: '/business/profile', name: 'BusinessProfile', component: BusinessProfile, meta: { IsLogin: true } },
    { path: '/business/email', name: 'BusinessEmail', component: BusinessEmail, meta: { IsLogin: true } },
    { path: '/product/list', name: 'ProductList', component: ProductList },
    { path: '/product/info', name: 'ProductInfo', component: ProductInfo },
    { path: '/business/address/index', name: 'AddressIndex', component: AddressIndex, meta: { IsLogin: true } },
    { path: '/business/address/add', name: 'AddressAdd', component: AddressAdd, meta: { IsLogin: true } },
    { path: '/business/address/edit', name: 'AddressEdit', component: AddressEdit, meta: { IsLogin: true } },
    { path: '/cart/index', name: 'CartIndex', component: CartIndex, meta: { IsLogin: true } },
    { path: '/cart/confirm', name: 'CartConfirm', component: CartConfirm, meta: { IsLogin: true } },
    { path: '/order/index', name: 'OrderIndex', component: OrderIndex, meta: { IsLogin: true } },
    { path: '/order/express', name: 'OrderExpress', component: OrderExpress, meta: { IsLogin: true } },
    { path: '/order/info', name: 'OrderInfo', component: OrderInfo, meta: { IsLogin: true } },
    { path: '/order/eveluate', name: 'OrderEveluate', component: OrderEveluate, meta: { IsLogin: true } },
    { path: '/register', name: 'register', component: register },
    { path: '/login', name: 'login', component: login }
  ]
})

/** 全局路由守卫：登录校验 */
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  if (!to.meta.IsLogin) { next(); return }

  const isLoggedIn = await userStore.checkLogin()
  if (!isLoggedIn) {
    showFailToast({ message: '请先登录', duration: 1000 })
    next('/login')
  } else {
    next()
  }
})

export default router
