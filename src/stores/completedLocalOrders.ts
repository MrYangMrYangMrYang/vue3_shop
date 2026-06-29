/**
 * @module stores/completedLocalOrders
 * @description 本地已完成订单 store：模拟支付成功的订单暂存，用于离线查看
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'completed_local_orders'

interface LocalOrder {
  id: string | number
  status?: string | number
  status_text?: string
  status_class?: string
  name_text?: string
  thumbs_text?: string
  amount?: number
  createtime?: string | number
  _isLocalCompleted?: boolean
}

export const useCompletedLocalOrdersStore = defineStore('completedLocalOrders', () => {
  const orders = ref<LocalOrder[]>(loadFromStorage())

  function loadFromStorage(): LocalOrder[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as LocalOrder[]) : []
    } catch {
      return []
    }
  }

  function saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
  }

  /** 添加已完成订单 */
  function addCompletedOrder(orderData: LocalOrder): void {
    if (!orderData || !orderData.id) return
    if (!orders.value.find(o => o.id === orderData.id)) {
      orders.value.unshift({ ...orderData, _isLocalCompleted: true })
      saveToStorage()
    }
  }

  /** 按状态筛选订单 */
  function getOrderByStatus(status: string | number): LocalOrder[] {
    return orders.value.filter(o => String(o.status) === String(status))
  }

  /** 获取所有订单 */
  function getAllOrders(): LocalOrder[] {
    return orders.value
  }

  /** 删除订单 */
  function removeOrder(orderId: string | number): void {
    orders.value = orders.value.filter(o => o.id !== orderId)
    saveToStorage()
  }

  function clearAll(): void {
    orders.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return { orders, addCompletedOrder, getOrderByStatus, getAllOrders, removeOrder, clearAll }
})
