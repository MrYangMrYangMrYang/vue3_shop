/**
 * @module hooks/useCheckoutSubmit
 * @description 结算页提交订单流程：构建本地待支付订单 → 询问是否立即支付 → 调 placeOrder 真正下单
 *              将 confirm.vue 中 90 行的 submit 逻辑收口为可独立测试的 composable
 */

import { ref, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast, showConfirmDialog, showDialog } from 'vant'
import { usePendingPaymentStore, type PendingOrder } from '@/stores/pendingPayment'
import { useCartStore } from '@/stores/cart'
import { POST } from '@/services/request'
import { normalizeIdList } from '@/utils/params'
import { formatDateTime } from '@/utils/date'
import { ORDER_STATUS } from '@/constants/order'

/** 结算页购物车商品（后端 /cart/index 返回字段 + 立即购买字段并集） */
export interface CartItem {
  id: string | number
  nums: string | number
  total: number
  price: number
  name?: string
  thumbs_text?: string
  stock?: number
  product?: {
    name?: string
    thumbs_text?: string
    stock?: number
  }
}

/** 结算页收货地址（consignee/mobile/address_text 在构建 pendingOrderData 时被访问） */
export interface AddressItem {
  id: string | number
  name: string
  tel: string
  address: string
  consignee?: string
  mobile?: string
  address_text?: string
}

interface UseCheckoutSubmitOptions {
  cartlist: Ref<CartItem[]>
  address: AddressItem[]
  cartids: string
  busid: string | number
  remark: Ref<string>
  action: string
  totalPrice: ComputedRef<number>
}

export function useCheckoutSubmit(options: UseCheckoutSubmitOptions) {
  const { cartlist, address, cartids, busid, remark, action, totalPrice } = options
  const submitting = ref(false)
  const router = useRouter()
  const pendingPaymentStore = usePendingPaymentStore()
  const cartStore = useCartStore()

  /** 跳转到订单列表对应状态 tab */
  const goToOrderList = (status: string | number): void => {
    router.replace({ path: '/order/index', query: { status } })
  }

  /** 提交订单并处理支付流程 */
  const submit = async (): Promise<void> => {
    if (submitting.value) return

    if (!address.length || !address[0] || !address[0].id) {
      showFailToast('请先添加或选择收货地址')
      return
    }

    const normalizedCartids = normalizeIdList(cartids)
    if (!normalizedCartids) {
      showFailToast('订单商品信息异常，请返回购物车重试')
      return
    }

    // 第一步：确认提交订单（用户取消则静默返回）
    try {
      await showConfirmDialog({
        title: '订单提醒',
        message: '是否确认提交订单',
        confirmButtonColor: '#FF464E'
      })
    } catch {
      return
    }

    submitting.value = true
    try {
      // 第二步：本地暂存待支付订单（待付款阶段不触碰后端，支付时才调 /order/add）
      const firstItem = cartlist.value[0] || {}
      const itemCount = cartlist.value.reduce((sum, c) => sum + parseInt(String(c.nums), 10), 0)
      const pendingOrderData: PendingOrder = {
        id: 'LOCAL_' + Date.now(),
        code: 'LOCAL' + Math.random().toString(36).slice(2, 11).toUpperCase(),
        status: '-2',
        status_text: '待支付',
        amount: totalPrice.value,
        createtime: Date.now(),
        createtime_text: formatDateTime(),
        cartids: normalizedCartids,
        addrid: address[0].id,
        remark: remark.value,
        action,
        item_count: itemCount,
        thumbs_text: firstItem.product?.thumbs_text || firstItem.thumbs_text || '',
        name_text: firstItem.product?.name || firstItem.name || '',
        address: address[0]
          ? {
              consignee: address[0].consignee,
              mobile: address[0].mobile,
              address_text: address[0].address_text
            }
          : null
      }

      pendingPaymentStore.addPendingOrder(pendingOrderData)

      // 下单后清除对应购物车商品（结算模式下才清，立即购买不处理购物车）
      if (action !== 'buy') {
        POST({ url: '/cart/delbuy', params: { cartid: normalizedCartids, busid } }).catch(() => {})
        cartStore.updateCount(0)
      }

      // 第三步：询问是否立即支付（取消则归档到待支付列表）
      try {
        await showConfirmDialog({
          title: '订单提交成功',
          message: '您的订单已成功提交，是否立即支付？',
          confirmButtonText: '立即支付',
          cancelButtonText: '稍后支付',
          confirmButtonColor: '#FF464E'
        })
      } catch {
        showSuccessToast('您可以稍后继续支付')
        goToOrderList(ORDER_STATUS.PENDING_PAYMENT)
        return
      }

      // 第四步：立即支付 → 调 placeOrder 真正下单（成功移除待付款、失败保留可重试）
      const result = await pendingPaymentStore.placeOrder(pendingOrderData.id)
      if (result.success) {
        await showDialog({
          title: '🎉 支付成功',
          message: '您的订单已支付完成！商家将尽快为您发货。',
          confirmButtonText: '查看订单',
          confirmButtonColor: '#FF464E'
        })
        goToOrderList(ORDER_STATUS.PENDING_SHIP)
      } else {
        showFailToast(result.msg || '支付失败，请稍后重试')
        goToOrderList(ORDER_STATUS.PENDING_PAYMENT)
      }
    } catch (error) {
      showFailToast('下单失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  }

  return { submitting, submit }
}
