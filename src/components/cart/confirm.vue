<!-- 
  @fileoverview 订单结算确认组件
  @module components/cart/confirm
  @description 负责下单前的最后确认：包括收货地址选择、商品清单预览、订单备注填写及最终提交订单，
               支持立即购买与购物车结算两种模式，是订单创建流程的关键页面
  @requires stores/user
  @requires stores/cart
  @requires services/request
  @example
  // 路由配置: /cart/confirm (需要登录)
  // 立即购买模式: ?action=buy&proid=123
  <router-link to="/cart/confirm">去结算</router-link>
-->
<template>
  <div class="confirm-page">
    <van-sticky>
      <van-nav-bar
        :title="action ? '购买结算' : '订单结算'"
        left-arrow
        @click-left="action ? backbuy() : back()"
        class="custom-nav"
      />
    </van-sticky>

    <!-- 首屏骨架屏 -->
    <ConfirmSkeleton v-if="loading" />

    <template v-else>
      <div class="confirm-content">
        <div class="address-section card-item">
          <div class="address-header">
            <van-icon name="location" class="location-icon" />
            <span class="title">收货地址</span>
          </div>

          <div v-if="address && address.length > 0" class="address-info" @click="AddressToggle">
            <div class="user-info">
              <span class="name">{{ address[0].name }}</span>
              <span class="tel">{{ address[0].tel }}</span>
            </div>
            <div class="address-detail">
              {{ address[0].address }}
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>

          <van-contact-card
            v-else
            type="add"
            add-text="请添加收货地址"
            @click="AddressAdd"
            class="add-address-card"
            style="--van-contact-card-add-icon-color: var(--primary-color)"
          />

          <div class="address-border"></div>
        </div>

        <div class="goods-section card-item">
          <div class="section-title">商品清单</div>
          <div class="cart-item" v-for="cart in cartlist" :key="cart.id">
            <van-card
              :num="cart.nums"
              :price="cart.total"
              :title="cart.product?.name || cart.name"
              :thumb="cart.product?.thumbs_text || cart.thumbs_text"
              lazy-load
            >
              <template #desc>
                <div class="goods-desc">
                  <span>单价: ¥{{ formatAmount(cart.price) }}</span>
                  <span class="stock">库存: {{ cart.product?.stock || cart.stock || 0 }}</span>
                </div>
              </template>
            </van-card>
          </div>
        </div>

        <div class="remark-section card-item">
          <div class="section-title">订单备注</div>
          <van-field
            v-model="remark"
            rows="2"
            autosize
            type="textarea"
            maxlength="100"
            placeholder="有什么想对卖家说的吗？"
            show-word-limit
            class="remark-input"
          />
        </div>
      </div>

      <van-submit-bar
        :price="price"
        button-text="提交订单"
        @submit="submit"
        safe-area-inset-bottom
        class="custom-submit-bar"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onBeforeMount, onActivated, computed } from 'vue'
import { POST } from '@/services/request'
import { showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { roundToTwo, formatAmount, toFen } from '@/utils/currency'
import { normalizeIdList, getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { useBack, useBusid, useCheckoutSubmit, type CartItem, type AddressItem } from '@/hooks'
import ConfirmSkeleton from './ConfirmSkeleton.vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

/** 用户ID */
const busid = useBusid()

const selectedAddrIdFromQuery = computed(() => getRouteQueryValue(route.query, 'selected_addr_id', ''))

const cartlist = ref<CartItem[]>([])
const cartids = getRouteQueryValue(route.query, 'cartids', '')
const remark = ref('')
const loading = ref(true)
const action = getRouteQueryValue(route.query, 'action', '')
const address = reactive<AddressItem[]>([])

/** 返回并清除临时购物车记录 */
const backbuy = async () => {
  const result = await POST({ url: '/cart/delbuy', params: { cartid: cartids, busid } })
  if (isBizFail(result)) showFailToast(result.msg || '操作失败')
  router.go(-1)
}

const back = useBack()

/** 跳转新增地址 */
const AddressAdd = () => {
  router.push('/business/address/add')
}

/** 跳转地址选择页 */
const AddressToggle = () => {
  router.push({
    path: '/business/address/index',
    query: { action: 'order', cartids: normalizeIdList(cartids), checkout_action: action }
  })
}

/** 清除地址选择参数 */
const clearSelectedAddrQuery = async () => {
  if (!selectedAddrIdFromQuery.value) return
  const nextQuery = { ...route.query }
  delete nextQuery.selected_addr_id
  await router.replace({ path: route.path, query: nextQuery })
}

/** 加载收货地址（优先使用指定地址，否则使用默认地址） */
const CartAddress = async () => {
  address.splice(0, address.length)
  try {
    const selectedId = Number(selectedAddrIdFromQuery.value) || selectedAddrIdFromQuery.value
    const addressListResult = await POST({
      url: '/address/index',
      params: { busid }
    })
    const addressList = Array.isArray(addressListResult?.data) ? addressListResult.data : []
    if (!isBizFail(addressListResult) && addressList.length > 0) {
      const matchedAddress = selectedId ? addressList.find(item => String(item.id) === String(selectedId)) : null
      // 结算页每次进入默认使用“默认地址”；仅在显式传入 selected_addr_id 时采用指定地址。
      const fallbackAddress = addressList.find(item => String(item.status) === '1') || addressList[0]
      const currentAddress = matchedAddress || fallbackAddress
      if (currentAddress) {
        userStore.setSelectedAddressId(currentAddress.id)
        userStore.setSelectedAddress({
          id: currentAddress.id,
          name: currentAddress.consignee,
          tel: currentAddress.mobile,
          address: `${currentAddress.address_text} ${currentAddress.address}`
        })
        address.push({
          id: currentAddress.id,
          name: currentAddress.consignee,
          tel: currentAddress.mobile,
          address: `${currentAddress.address_text} ${currentAddress.address}`
        })
        await clearSelectedAddrQuery()
        return
      }
    }

    const result = await POST({
      url: '/address/order',
      params: {
        busid,
        addrid: selectedId || 0
      }
    })
    if (isBizFail(result) || !result.data) {
      return
    }

    const addrData = result.data as {
      id: number
      consignee: string
      mobile: string
      address_text: string
      address: string
    }
    userStore.setSelectedAddress({
      id: addrData.id,
      name: addrData.consignee,
      tel: addrData.mobile,
      address: `${addrData.address_text} ${addrData.address}`
    })
    address.push({
      id: addrData.id,
      name: addrData.consignee,
      tel: addrData.mobile,
      address: `${addrData.address_text} ${addrData.address}`
    })
    await clearSelectedAddrQuery()
  } catch (error) {
    showFailToast('收货地址加载失败，请稍后重试')
  }
}

/** 加载购物车商品 */
const CartData = async () => {
  try {
    const result = await POST({
      url: '/cart/index',
      params: {
        busid,
        cartids: normalizeIdList(cartids)
      }
    })
    cartlist.value = Array.isArray(result.data) ? result.data : []
  } catch (error) {
    cartlist.value = []
    showFailToast('商品信息加载失败，请稍后重试')
  }
}

onBeforeMount(async () => {
  try {
    await CartData()
    await CartAddress()
  } finally {
    loading.value = false
  }
})

onActivated(async () => {
  await CartAddress()
})

/** 订单总价（元，供 amount 存储与显示） */
const totalPrice = computed(() => {
  let count = 0
  cartlist.value.forEach(item => {
    count += roundToTwo(item.total)
  })
  return roundToTwo(count)
})

/** 订单总价（分，供 van-submit-bar 使用，Vant 会自动除以 100 显示为元） */
const price = computed(() => toFen(totalPrice.value))

/** 提交订单并处理支付流程（逻辑收口于 useCheckoutSubmit composable，便于独立测试） */
const { submit } = useCheckoutSubmit({
  cartlist,
  address,
  cartids,
  remark,
  action,
  totalPrice
})
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon),
:deep(.van-nav-bar__text) {
  color: white !important;
}

.confirm-content {
  padding: 12px;
}

.card-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.address-section {
  position: relative;
  padding: 16px;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.location-icon {
  font-size: 18px;
  color: var(--primary-color);
  margin-right: 6px;
}

.address-info {
  position: relative;
  padding-right: 24px;
}

.user-info {
  margin-bottom: 4px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  margin-right: 8px;
}

.tel {
  font-size: 14px;
  color: var(--text-secondary);
}

.address-detail {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
}

.arrow-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-placeholder);
}

.address-border {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-image: repeating-linear-gradient(
    -45deg,
    #ff464e 0,
    #ff464e 20%,
    transparent 20%,
    transparent 25%,
    #58a 25%,
    #58a 45%,
    transparent 45%,
    transparent 50%
  );
  background-size: 80px 3px;
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.goods-section :deep(.van-card) {
  background: white;
  padding: 8px 16px;
}

.goods-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
}

.remark-input {
  padding: 12px 16px;
}

.custom-submit-bar {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

:deep(.van-submit-bar__price-integer) {
  font-size: 22px;
  font-weight: 800;
}

:deep(.van-submit-bar__price-decimal) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.van-submit-bar__button--danger) {
  background: var(--primary-gradient);
  border: none;
}

:deep(.van-contact-card::before) {
  display: none;
}

.add-address-card {
  padding: 12px 0;
  --van-contact-card-add-icon-color: var(--primary-color);
}

.add-address-card :deep(.van-contact-card__icon) {
  color: var(--primary-color) !important;
}

.add-address-card :deep(.van-icon-add-square) {
  color: var(--primary-color) !important;
}
</style>
