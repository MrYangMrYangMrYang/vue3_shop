/**
 * @module stores/pendingPayment
 * @description 本地待支付订单 store：提交订单后未支付时暂存订单（纯前端模拟待付款业务），
 *              支付时由 placeOrder 调用后端 /order/add 真正下单；支持过期自动清理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { POST } from '@/services/request'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getRemainingTime, isPaymentExpired } from '@/utils/countdown'
import { isBizSuccess } from '@/utils/result'

const STORAGE_KEY = 'pending_payment_orders'

export interface PendingOrder {
  id: string | number
  createtime?: string | number
  createtime_text?: string
  name_text?: string
  thumbs_text?: string
  amount?: number
  status?: string
  status_text?: string
  status_class?: string
  address?: {
    consignee?: string
    mobile?: string
    address_text?: string
    address?: string
  } | null
  _isLocalPending?: boolean
  created_at?: number
  /** 订单号（本地生成，展示用） */
  code?: string
  /** 逗号分隔的购物车 id 串，支付时原样传入 /order/add */
  cartids?: string
  /** 收货地址 id，支付时传入 /order/add */
  addrid?: string | number
  /** 订单备注，支付时传入 /order/add */
  remark?: string
  /** 'buy' 为立即购买模式，取消/超时时需调 /cart/delbuy 清理临时购物车记录 */
  action?: string
  /** 占用购物车件数（sum(nums)），供角标计算 */
  item_count?: number
}

/** placeOrder 返回结果 */
export interface PlaceOrderResult {
  success: boolean
  url?: string
  msg?: string
}

export const usePendingPaymentStore = defineStore('pendingPayment', () => {
  const orders = ref<PendingOrder[]>(loadFromStorage())
  let autoCleanTimer: ReturnType<typeof setInterval> | null = null
  /** 正在支付中的订单 id 集合，防止重复提交 */
  const placingOrderIds = new Set<string | number>()

  function loadFromStorage(): PendingOrder[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as PendingOrder[]) : []
    } catch {
      return []
    }
  }

  function saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
  }

  /** 添加待支付订单 */
  function addPendingOrder(orderData: PendingOrder): void {
    if (!orderData || !orderData.id) return
    const exists = orders.value.find(o => o.id === orderData.id)
    if (exists) Object.assign(exists, orderData)
    else
      orders.value.unshift({
        ...orderData,
        _isLocalPending: true,
        status: '-2',
        status_text: '待支付',
        status_class: 'status-pending-payment',
        created_at: Date.now()
      })
    saveToStorage()
    startAutoClean()
  }

  /** 移除待支付订单 */
  function removePendingOrder(orderId: string | number): void {
    orders.value = orders.value.filter(o => o.id !== orderId)
    saveToStorage()
  }

  function getPendingOrder(orderId: string | number): PendingOrder | undefined {
    return orders.value.find(o => o.id === orderId)
  }

  /** 清理立即购买临时购物车记录（fire-and-forget，失败静默） */
  function cleanupBuyTempCart(order: PendingOrder, busid: string | number): void {
    if (order.action === 'buy' && order.cartids) {
      POST({ url: '/cart/delbuy', params: { cartid: order.cartids, busid } }).catch(() => {})
    }
  }

  /** 清除过期订单，返回清除数量 */
  function clearExpiredOrders(): number {
    const beforeCount = orders.value.length
    const busid = useUserStore().userInfo?.id ?? 0
    const expired: PendingOrder[] = []
    orders.value = orders.value.filter(o => {
      const isExpired = !o.createtime || getRemainingTime(o.createtime) <= 0
      if (isExpired) {
        expired.push(o)
        return false
      }
      return true
    })
    // 过期的立即购买订单需清理后端临时购物车记录
    if (busid) expired.forEach(o => cleanupBuyTempCart(o, busid))
    const removedCount = beforeCount - orders.value.length
    if (removedCount > 0) saveToStorage()
    return removedCount
  }

  /** 清除不完整订单 */
  function clearIncompleteOrders(): number {
    const beforeCount = orders.value.length
    orders.value = orders.value.filter(
      o => o.thumbs_text && o.name_text && o.amount && o.amount > 0 && o.cartids && o.addrid
    )
    if (beforeCount !== orders.value.length) saveToStorage()
    return beforeCount - orders.value.length
  }

  /**
   * 支付（真正下单）：用本地暂存的 cartids/addrid/remark 调 /order/add
   * 成功则移除待付款订单；失败则保留以便重试
   */
  async function placeOrder(orderId: string | number): Promise<PlaceOrderResult> {
    if (placingOrderIds.has(orderId)) {
      return { success: false, msg: '支付处理中，请勿重复提交' }
    }

    const order = getPendingOrder(orderId)
    if (!order) return { success: false, msg: '订单不存在或已支付' }

    if (isPaymentExpired(order.createtime)) {
      removePendingOrder(orderId)
      return { success: false, msg: '支付已超时，请重新下单' }
    }

    const busid = useUserStore().userInfo?.id ?? 0
    if (!busid) return { success: false, msg: '登录状态异常' }

    if (!order.cartids || !order.addrid) {
      return { success: false, msg: '订单数据不完整' }
    }

    placingOrderIds.add(orderId)
    try {
      const result = await POST({
        url: '/order/add',
        params: {
          busid,
          addrid: order.addrid,
          remark: order.remark || '',
          cartids: order.cartids
        }
      })

      if (isBizSuccess(result)) {
        // 先缓存清理所需字段，移除后将无法取回
        cleanupBuyTempCart(order, busid)
        removePendingOrder(orderId)
        // 后端 /order/add 已删除购物车项，同步角标
        useCartStore().updateCount(busid)
        const url = typeof result.url === 'string' ? result.url : ''
        return { success: true, url }
      }
      return { success: false, msg: result.msg || '下单失败，请稍后重试' }
    } catch (error) {
      return { success: false, msg: '网络异常，请稍后重试' }
    } finally {
      placingOrderIds.delete(orderId)
    }
  }

  /** 启动自动清理定时器（每秒检查） */
  function startAutoClean(): void {
    stopAutoClean()
    autoCleanTimer = setInterval(() => {
      if (clearExpiredOrders() > 0 && orders.value.length === 0) stopAutoClean()
    }, 1000)
  }

  function stopAutoClean(): void {
    if (autoCleanTimer) {
      clearInterval(autoCleanTimer)
      autoCleanTimer = null
    }
  }

  function clearAll(): void {
    stopAutoClean()
    orders.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  const pendingCount = computed(() => orders.value.length)
  /** 待付款订单占用的购物车件数（供角标计算） */
  const occupiedCount = computed(() => orders.value.reduce((sum, o) => sum + (Number(o.item_count) || 0), 0))

  return {
    orders,
    pendingCount,
    occupiedCount,
    addPendingOrder,
    removePendingOrder,
    getPendingOrder,
    placeOrder,
    clearExpiredOrders,
    clearIncompleteOrders,
    clearAll,
    startAutoClean,
    stopAutoClean
  }
})
