import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ORDER_PAYMENT_TIMEOUT_MS } from '@/constants/order'
import { getRemainingTime } from '@/utils/countdown'

const STORAGE_KEY = 'pending_payment_orders'

export const usePendingPaymentStore = defineStore('pendingPayment', () => {
  const orders = ref(loadFromStorage())
  let autoCleanTimer = null

  function loadFromStorage() {
    try { return localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)) : [] }
    catch { return [] }
  }

  function saveToStorage() { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value)) }

  /** 添加待支付订单 */
  function addPendingOrder(orderData) {
    if (!orderData || !orderData.id) return
    const exists = orders.value.find(o => o.id === orderData.id)
    if (exists) Object.assign(exists, orderData)
    else orders.value.unshift({ ...orderData, _isLocalPending: true, status: '-2', status_text: '待支付', status_class: 'status-pending-payment', created_at: Date.now() })
    saveToStorage()
    startAutoClean()
  }

  /** 移除待支付订单 */
  function removePendingOrder(orderId) {
    orders.value = orders.value.filter(o => o.id !== orderId)
    saveToStorage()
  }

  function getPendingOrder(orderId) { return orders.value.find(o => o.id === orderId) }

  /** 清除过期订单，返回清除数量 */
  function clearExpiredOrders() {
    const beforeCount = orders.value.length
    orders.value = orders.value.filter(o => o.createtime && getRemainingTime(o.createtime) > 0)
    const removedCount = beforeCount - orders.value.length
    if (removedCount > 0) saveToStorage()
    return removedCount
  }

  /** 清除不完整订单 */
  function clearIncompleteOrders() {
    const beforeCount = orders.value.length
    orders.value = orders.value.filter(o => o.thumbs_text && o.name_text && o.amount > 0)
    if (beforeCount !== orders.value.length) saveToStorage()
    return beforeCount - orders.value.length
  }

  /** 启动自动清理定时器（每秒检查） */
  function startAutoClean() {
    stopAutoClean()
    autoCleanTimer = setInterval(() => {
      if (clearExpiredOrders() > 0 && orders.value.length === 0) stopAutoClean()
    }, 1000)
  }

  function stopAutoClean() {
    if (autoCleanTimer) { clearInterval(autoCleanTimer); autoCleanTimer = null }
  }

  function clearAll() { stopAutoClean(); orders.value = []; localStorage.removeItem(STORAGE_KEY) }

  const pendingCount = computed(() => orders.value.length)

  return {
    orders,
    pendingCount,
    addPendingOrder,
    removePendingOrder,
    getPendingOrder,
    clearExpiredOrders,
    clearIncompleteOrders,
    clearAll,
    startAutoClean,
    stopAutoClean
  }
})
