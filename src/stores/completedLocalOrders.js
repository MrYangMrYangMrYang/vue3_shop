import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'completed_local_orders'

export const useCompletedLocalOrdersStore = defineStore('completedLocalOrders', () => {
  const orders = ref(loadFromStorage())

  function loadFromStorage() {
    try { return localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)) : [] }
    catch { return [] }
  }

  function saveToStorage() { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value)) }

  /** 添加已完成订单 */
  function addCompletedOrder(orderData) {
    if (!orderData || !orderData.id) return
    if (!orders.value.find(o => o.id === orderData.id)) {
      orders.value.unshift({ ...orderData, _isLocalCompleted: true })
      saveToStorage()
    }
  }

  /** 按状态筛选订单 */
  function getOrderByStatus(status) { return orders.value.filter(o => String(o.status) === String(status)) }

  /** 获取所有订单 */
  function getAllOrders() { return orders.value }

  /** 删除订单 */
  function removeOrder(orderId) {
    orders.value = orders.value.filter(o => o.id !== orderId)
    saveToStorage()
  }

  function clearAll() { orders.value = []; localStorage.removeItem(STORAGE_KEY) }

  return { orders, addCompletedOrder, getOrderByStatus, getAllOrders, removeOrder, clearAll }
})
