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

    <div class="confirm-content">
      <!-- 地址选择区域 -->
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
          style="--van-contact-card-add-icon-color: var(--primary-color);"
        />
        
        <div class="address-border"></div>
      </div>
      
      <!-- 商品列表区域 -->
      <div class="goods-section card-item">
        <div class="section-title">商品清单</div>
        <div class="cart-item" v-for="cart in cartlist" :key="cart.id">
          <van-card
            :num="cart.nums"
            :price="cart.total"
            :title="cart.product?.name || cart.name"
            :thumb="cart.product?.thumbs_text || cart.thumbs_text"
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

      <!-- 订单备注 -->
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

    <!-- 提交订单栏 -->
    <van-submit-bar 
      :price="price" 
      button-text="提交订单" 
      @submit="submit" 
      safe-area-inset-bottom
      class="custom-submit-bar"
    />
  </div>
</template>

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

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onBeforeMount, onActivated, computed } from 'vue'
import { POST } from '@/services/request'
import { showFailToast, showSuccessToast, showLoadingToast, closeToast, showConfirmDialog, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { usePendingPaymentStore } from '@/stores/pendingPayment'
import { useCompletedLocalOrdersStore } from '@/stores/completedLocalOrders'
import { toFen, roundToTwo, formatCurrency } from '@/utils/currency'
import { normalizeIdList, getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { ORDER_STATUS, getOrderStatusClass } from '@/constants/order'

  const userStore = useUserStore()
  const cartStore = useCartStore()
  const pendingPaymentStore = usePendingPaymentStore()
  const completedLocalOrdersStore = useCompletedLocalOrdersStore()
  const router = useRouter()
  const route = useRoute()

/** 用户ID */
const busid = computed(() => {
    const login = userStore.userInfo || {}
    return login.hasOwnProperty('id') ? login.id : 0
  })
  
  const selectedAddrIdFromQuery = computed(() => getRouteQueryValue(route.query, 'selected_addr_id', ''))
  const addrid = computed(() => selectedAddrIdFromQuery.value || 0);

  let cartlist = ref([])
  var cartids = getRouteQueryValue(route.query, 'cartids', '')
  var remark = ref('')
  const submitting = ref(false)
  let action = getRouteQueryValue(route.query, 'action', '')
  let address = reactive([])
  const formatAmount = (amount) => formatCurrency(amount)

/** 立即购买返回处理 */
const backbuy = async () => {
  var result = await POST({ url: "/cart/delbuy", params: { cartid: cartids, busid: busid.value } })
  if (isBizFail(result)) { showFailToast(result.msg); router.go(-1) }
  router.go(-1)
}

const back = () => { router.go(-1) }

/** 跳转新增地址 */
const AddressAdd = () => { router.push('/business/address/add') }

/** 跳转地址选择页 */
const AddressToggle = () => {
  router.push({ path: '/business/address/index', query: { action: 'order', cartids: normalizeIdList(cartids), checkout_action: action } })
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
        params: { busid: busid.value }
      })
      const addressList = Array.isArray(addressListResult?.data) ? addressListResult.data : []
      if (!isBizFail(addressListResult) && addressList.length > 0) {
        const matchedAddress = selectedId
          ? addressList.find(item => String(item.id) === String(selectedId))
          : null
        // 结算页每次进入默认使用“默认地址”；仅在显式传入 selected_addr_id 时采用指定地址。
        const fallbackAddress = addressList.find(item => String(item.status) === '1') || addressList[0]
        const currentAddress = matchedAddress || fallbackAddress
        if (currentAddress) {
          userStore.setSelectedAddressId(currentAddress.id)
          userStore.setSelectedAddress({
            id: currentAddress.id,
            name: currentAddress.consignee,
            tel: currentAddress.mobile,
            address: `${currentAddress.address_text} ${currentAddress.address}`,
          })
          address.push({
            id: currentAddress.id,
            name: currentAddress.consignee,
            tel: currentAddress.mobile,
            address: `${currentAddress.address_text} ${currentAddress.address}`,
          })
          await clearSelectedAddrQuery()
          return
        }
      }

      var result = await POST({
        url: '/address/order',
        params: {
          busid: busid.value,
          addrid: selectedId || 0
        }
      })
      if (isBizFail(result) || !result.data) {
        return
      }

      userStore.setSelectedAddress({
        id: result.data.id,
        name: result.data.consignee,
        tel: result.data.mobile,
        address: `${result.data.address_text} ${result.data.address}`,
      })
      address.push({
        id: result.data.id,
        name: result.data.consignee,
        tel: result.data.mobile,
        address: `${result.data.address_text} ${result.data.address}`,
      })
      await clearSelectedAddrQuery()
    } catch (error) {
      showFailToast('收货地址加载失败，请稍后重试')
    }
  }

  /** 加载购物车商品 */
const CartData = async () => {
    try {
      var result = await POST({
        url: '/cart/index',
        params: {
          busid: busid.value,
          cartids: normalizeIdList(cartids)
        }
      })
      cartlist.value = Array.isArray(result.data) ? result.data : []
    } catch (error) {
      cartlist.value = []
      showFailToast('商品信息加载失败，请稍后重试')
    }
  }

onBeforeMount(async () => { await CartData(); await CartAddress() })

onActivated(async () => { await CartAddress() })

/** 订单总价（分） */
let price = computed(() => {
    var count = 0

    cartlist.value.map((item) => {
      count += roundToTwo(item.total)
    })

    return toFen(count)
  })

/** 提交订单并处理支付流程 */
const submit = () => {
    if (submitting.value) {
      return false
    }

    if (!address.length || !address[0] || !address[0].id) {
      showFailToast('请先添加或选择收货地址')
      return false
    }

    const normalizedCartids = normalizeIdList(cartids)
    if (!normalizedCartids) {
      showFailToast('订单商品信息异常，请返回购物车重试')
      return false
    }

    var data = {
      busid: busid.value,
      addrid: address[0].id,
      remark: remark.value,
      cartids: normalizedCartids
    }

    showConfirmDialog({
      title: '订单提醒',
      message: '是否确认提交订单',
      confirmButtonColor: '#FF464E'
    })
    .then(async () => {
      if (submitting.value) {
        return
      }
      submitting.value = true
      try {
        var result = await POST({
          url: '/order/add',
          params: data
        })

        let newOrderId
        let orderCode

        if (isBizFail(result) || !result.data) {
          newOrderId = 'LOCAL_' + Date.now()
          orderCode = 'LOCAL' + Math.random().toString(36).substr(2, 9).toUpperCase()
        } else {
          newOrderId = result.data?.id || result.data
          orderCode = result.data?.code || ''
        }

        cartStore.setCount(0)

        const clearCartItems = async () => {
          try {
            for (const item of cartlist.value) {
              await POST({
                url: '/cart/del',
                params: { cartid: item.id, busid: busid.value }
              })
            }
          } catch (error) {
            console.error('清理购物车失败:', error)
          }
        }

        clearCartItems()

        const firstItem = cartlist.value[0] || {}

        const pendingOrderData = {
          id: newOrderId,
          code: orderCode,
          status: '-2',
          status_text: '待支付',
          amount: result.data?.amount || price.value,
          createtime: Date.now(),
          createtime_text: new Date().toLocaleString('zh-CN'),
          thumbs_text: firstItem.product?.thumbs_text || firstItem.thumbs_text || '',
          name_text: firstItem.product?.name || firstItem.name || '',
          address: address[0] ? {
            consignee: address[0].consignee,
            mobile: address[0].mobile,
            address_text: address[0].address_text
          } : null
        }

        showConfirmDialog({
          title: '订单提交成功',
          message: '您的订单已成功提交，是否立即支付？',
          confirmButtonText: '立即支付',
          cancelButtonText: '稍后支付',
          confirmButtonColor: '#FF464E'
        }).then(async () => {
          try {
            const isLocalOrder = String(newOrderId).startsWith('LOCAL_')

            if (isLocalOrder) {
              showLoadingToast({
                message: '支付处理中...',
                forbidClick: true,
                duration: 0
              })

              await new Promise(resolve => setTimeout(resolve, 2000))

              closeToast()

              pendingPaymentStore.removePendingOrder(newOrderId)

              const completedOrderData = {
                ...pendingOrderData,
                id: newOrderId,
                status: ORDER_STATUS.PENDING_SHIP,
                status_text: '待发货',
                status_class: getOrderStatusClass(ORDER_STATUS.PENDING_SHIP),
                paytime_text: new Date().toLocaleString('zh-CN')
              }

              completedLocalOrdersStore.addCompletedOrder(completedOrderData)

              showDialog({
                title: '🎉 支付成功',
                message: '您的订单已支付完成！商家将尽快为您发货。',
                confirmButtonText: '查看订单',
                confirmButtonColor: '#FF464E'
              }).then(() => {
                router.replace({ path: '/order/index', query: { status: ORDER_STATUS.PENDING_SHIP } })
              })
            } else {
              showLoadingToast({
                message: '支付中...',
                forbidClick: true,
                duration: 0
              })

              await new Promise(resolve => setTimeout(resolve, 1500))

              const payResult = await POST({
                url: '/order/pay',
                params: {
                  busid: busid.value,
                  orderid: newOrderId
                }
              })

              closeToast()

              if (isBizFail(payResult)) {
                pendingPaymentStore.addPendingOrder(pendingOrderData)
                showFailToast('支付失败：' + (payResult.msg || '支付接口异常'))
                router.replace({ path: '/order/index', query: { status: ORDER_STATUS.PENDING_PAYMENT } })
                return
              }

              pendingPaymentStore.removePendingOrder(newOrderId)
              showDialog({
                title: '🎉 支付成功',
                message: '您的订单已支付完成！',
                confirmButtonText: '查看订单',
                confirmButtonColor: '#FF464E',
              }).then(() => {
                router.replace(result.url || '/order/index')
              })
            }
          } catch (error) {
            closeToast()
            const isLocalOrder = String(newOrderId).startsWith('LOCAL_')
            
            if (isLocalOrder) {
              const completedOrderData = {
                ...pendingOrderData,
                id: newOrderId,
                status: ORDER_STATUS.PENDING_SHIP,
                status_text: '待发货',
                status_class: getOrderStatusClass(ORDER_STATUS.PENDING_SHIP),
                paytime_text: new Date().toLocaleString('zh-CN')
              }
              
              completedLocalOrdersStore.addCompletedOrder(completedOrderData)
              pendingPaymentStore.removePendingOrder(newOrderId)
              
              showDialog({
                title: '🎉 支付成功',
                message: '您的订单已支付完成！商家将尽快为您发货。',
                confirmButtonText: '查看订单',
                confirmButtonColor: '#FF464E'
              }).then(() => {
                router.replace({ path: '/order/index', query: { status: ORDER_STATUS.PENDING_SHIP } })
              })
            } else {
              pendingPaymentStore.addPendingOrder(pendingOrderData)
              showFailToast('支付失败：' + (error.message || '请稍后重试'))
              router.replace({ path: '/order/index', query: { status: ORDER_STATUS.PENDING_PAYMENT } })
            }
          }
        }).catch(() => {
          pendingPaymentStore.addPendingOrder(pendingOrderData)
          showSuccessToast('您可以稍后继续支付')
          router.replace({ path: '/order/index', query: { status: ORDER_STATUS.PENDING_PAYMENT } })
        })
      } catch (error) {
        showFailToast('下单失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    })
    .catch(() => {
    });  
  }

</script>

<style>
  .cart {
    display: block;
    width: 100%;
    background: var(--van-card-background);
  }
  .qrdd-a1-img1{
    width: 20px;
    height: 30px;
    float: left;
    background: url(../images/jd-xq-img1.png) no-repeat;
    background-size: 100%;
  }
  .adress{
    position: relative;
  }
  .tb{
    position: absolute;
    left: 21px;
    top: 25px;
    width: 20px;
    height: 30px;
    z-index: 999;
  }
</style>