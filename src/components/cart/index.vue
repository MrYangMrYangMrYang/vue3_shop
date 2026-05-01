<!-- 
  @fileoverview 购物车管理组件
  @module components/cart/index
  @description 负责已选商品的列表展示、数量调整（步进器）、商品删除（左滑）及全选/勾选结算逻辑，
               是购物流程的核心页面，支持实时计算选中商品总价
  @requires stores/cart
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /cart/index (需要登录)
  <router-link to="/cart/index">购物车</router-link>
-->
<template>
  <div class="cart-page">
    <van-sticky>
      <van-nav-bar title="购物车" left-arrow @click-left="back" />
    </van-sticky>

    <div class="cart-list-container">
      <van-checkbox-group v-model="checked" @change="CheckList">
        <div class="cart-item" v-for="cart in cartlist" :key="cart.id">
          <div class="checkbox-wrapper">
            <van-checkbox :name="cart.id" icon-size="20px" checked-color="#FF464E" />
          </div>

          <van-swipe-cell class="swipe-wrapper">
            <div class="goods-card-wrapper" @click="goToProduct(cart.product?.id || cart.proid)">
              <van-card 
                class="goods-card" 
                :thumb="cart.product?.thumbs_text || cart.thumbs_text || cart.image || cart.product?.image"
                lazy-load
              >
                <template #title>
                  <div class="product-title">{{ cart.product?.name || cart.name || cart.proname }}</div>
                </template>
                <template #price>
                  <div class="price-row">
                    <span class="currency">¥</span>
                    <span class="amount">{{ getCartTotal(cart) }}</span>
                  </div>
                </template>
                <template #desc>
                  <div class="desc-info">
                    <div class="stock">库存：{{ cart.product?.stock || cart.stock || 0 }}</div>
                    <div class="unit-price">单价：¥{{ formatAmount(cart.price) }}</div>
                  </div>
                </template>
                <template #num>
                  <div @click.stop>
                    <van-stepper 
                      v-model="cart.nums" 
                      :name="cart.id" 
                      disable-input 
                      @change="CartStep"
                      button-size="28px"
                      integer
                    />
                  </div>
                </template>
              </van-card>
            </div>

            <template #right>
              <van-button square text="删除" type="danger" class="delete-button" @click="CartDel(cart.id)" />
            </template>
          </van-swipe-cell>
        </div>
      </van-checkbox-group>

      <van-empty v-if="cartlist.length === 0" description="购物车空空如也" image="search">
        <van-button round type="primary" class="go-shop-btn" to="/">去逛逛</van-button>
      </van-empty>
    </div>

    <van-submit-bar 
      :price="price" 
      button-text="结算" 
      @submit="submit" 
      class="submit-bar"
    >
      <van-checkbox v-model="toggle" @click="ToggleCheck" checked-color="#FF464E">全选</van-checkbox>
    </van-submit-bar>

    <Menu />
  </div>
</template>

<style scoped>
.cart-page {
  background: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 0;
}

:deep(.van-nav-bar) {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon) {
  color: white !important;
}

.cart-list-container {
  padding: var(--spacing-md);
  padding-bottom: 100px;
}

.cart-item {
  display: flex;
  align-items: stretch;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.cart-item:active {
  transform: scale(0.99);
}

.checkbox-wrapper {
  flex-shrink: 0;
  margin-right: 4px;
  display: flex;
  align-items: center;
}

.swipe-wrapper {
  flex: 1;
}

.goods-card-wrapper {
  flex: 1;
  cursor: pointer;
}

.goods-card {
  background: transparent !important;
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 0;
}

:deep(.van-card__thumb) {
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

:deep(.van-card__thumb img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 6px;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  min-height: 42px;
}

.price-row {
  color: var(--primary-color);
  font-weight: 700;
  margin-top: 8px;
}

.currency {
  font-size: 12px;
}

.amount {
  font-size: 18px;
  font-weight: 700;
}

.desc-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.stock {
  color: var(--text-secondary);
}

.unit-price {
  color: var(--text-secondary);
}

:deep(.van-stepper) {
  --van-stepper-active-color: #FF464E;
  --van-stepper-button-size: 28px;
}

:deep(.van-stepper__minus),
:deep(.van-stepper__plus) {
  background-color: var(--bg-color);
  border-radius: var(--radius-full);
  border: none;
}

:deep(.van-stepper__input) {
  background-color: transparent;
  font-weight: 500;
  width: 32px;
}

.delete-button {
  height: 100%;
  width: 70px;
  border-radius: 0 !important;
  background: var(--danger-color) !important;
  font-weight: 500;
}

/* ========== 提交栏 - 紧贴 TabBar ========== */
.submit-bar {
  position: fixed !important;
  bottom: 50px !important;
  left: 0 !important;
  right: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  background: rgba(255, 255, 255, 0.96) !important;
  transition: all var(--transition-fast);
  z-index: 99;
}

:deep(.van-submit-bar__bar) {
  padding: 12px 16px;
  background: transparent !important;
}

:deep(.van-submit-bar__price) {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

:deep(.van-submit-bar__price .van-submit-bar__price-integer) {
  font-size: 22px;
  font-weight: 800;
}

:deep(.van-submit-bar__price .van-submit-bar__price-currency) {
  font-size: 14px;
}

:deep(.van-submit-bar__button--danger) {
  background: var(--primary-gradient);
  border: none;
  border-radius: 30px !important;
  padding: 0 28px;
  height: 44px;
  font-weight: 500;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.25);
  transition: transform var(--transition-fast);
}

:deep(.van-submit-bar__button--danger:active) {
  transform: scale(0.96);
  box-shadow: 0 2px 6px rgba(255, 70, 78, 0.2);
}

:deep(.van-checkbox__label) {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

/* 底部 TabBar 样式 - 紧贴结算栏 */
:deep(.van-tabbar) {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  background: rgba(255, 255, 255, 0.96) !important;
  border-top: none;
  height: 50px;
  z-index: 100;
}

.go-shop-btn {
  width: 160px;
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-full);
}
</style>

<script setup>
defineOptions({ name: 'cart' })

import { useRouter } from 'vue-router'
import { ref, onBeforeMount, computed, watch } from 'vue'
import Menu from '@/components/common/Menu.vue'
import { POST } from '@/services/request'
import axios from 'axios'
import { showFailToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { toFen, roundToTwo, formatCurrency } from '@/utils/currency'
import { normalizeIdList } from '@/utils/params'
import { isBizSuccess, isBizFail } from '@/utils/result'
import { useBack } from '@/hooks'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const back = useBack()

/** 用户ID */
const busid = computed(() => {
  const login = userStore.userInfo || {}
  return login.hasOwnProperty('id') ? login.id : 0
})

const cartlist = ref([])
const checked = ref([])
const toggle = ref(false)
const mutating = ref(false)

/** 跳转商品详情 */
const goToProduct = (productId) => {
  if (productId) router.push({ path: '/product/info', query: { proid: productId } })
}

/** 加载购物车数据 */
const CartData = async () => {
  if (!busid.value) return

  try {
    const result = await POST({ url: '/cart/index', params: { busid: busid.value } })

    if (isBizSuccess(result)) {
      cartlist.value = result.data || []
      const totalNums = cartlist.value.reduce((sum, item) => sum + parseInt(item.nums || 0), 0)
      cartStore.setCount(totalNums)
    } else {
      cartlist.value = []
      cartStore.setCount(0)
    }
  } catch (error) {
    if (!axios.isCancel(error)) showFailToast('购物车加载失败，请稍后重试')
  }
}

onBeforeMount(() => {})

watch(busid, (newVal) => {
  if (newVal) CartData()
  else { cartlist.value = []; cartStore.setCount(0) }
}, { immediate: true })

/** 全选/取消全选 */
const ToggleCheck = () => {
  if (toggle.value) checked.value = cartlist.value.map(item => item.id)
  else checked.value = []
}

/** 更新全选状态 */
const CheckList = (value) => {
  const list = cartlist.value.map(item => item.id)
  const result = checked.value.length === list.length && [...checked.value].sort().toString() === list.sort().toString()
  toggle.value = result
}

/** 计算选中商品总价（分） */
const price = computed(() => {
  let sum = 0
  cartlist.value.forEach(item => {
    if (checked.value.includes(item.id)) sum += roundToTwo(item.total)
  })
  return toFen(sum)
})

const formatAmount = (amount) => formatCurrency(amount)

/** 计算单件商品小计 */
const getCartTotal = (cart) => {
  const total = cart.total || (roundToTwo(cart.price) * parseInt(cart.nums || 0, 10))
  return formatAmount(total)
}

/** 修改商品数量 */
const CartStep = async (_value, detail) => {
  if (mutating.value) return
  mutating.value = true
  const data = { busid: busid.value, cartid: detail.name, nums: value }

  try {
    const result = await POST({ url: '/cart/edit', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    cartlist.value = result.data
    const totalNums = cartlist.value.reduce((sum, item) => sum + parseInt(item.nums), 0)
    cartStore.setCount(totalNums)
  } catch (error) {
    showFailToast('更新购物车失败，请稍后重试')
  } finally {
    mutating.value = false
  }
}

/** 删除商品 */
const CartDel = async (cartid) => {
  showConfirmDialog({
    title: '删除提醒',
    message: '是否确认删除该宝贝',
    confirmButtonColor: '#FF464E'
  }).then(async () => {
    if (mutating.value) return
    mutating.value = true
    const data = { cartid, busid: busid.value }

    try {
      const result = await POST({ url: '/cart/del', params: data })
      if (isBizFail(result)) { showFailToast(result.msg); return false }

      cartlist.value = result.data
      const totalNums = cartlist.value.reduce((sum, item) => sum + parseInt(item.nums), 0)
      cartStore.setCount(totalNums)
      checked.value = checked.value.filter(id => id !== cartid)
    } catch (error) {
      showFailToast('删除失败，请稍后重试')
    } finally {
      mutating.value = false
    }
  }).catch(() => {})
}

/** 提交结算 */
const submit = () => {
  if (checked.value.length <= 0) { showFailToast('请选择购物车商品'); return false }
  router.push({ path: '/cart/confirm', query: { cartids: normalizeIdList(checked.value) } })
}
</script>