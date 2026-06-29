/**
 * @module stores/cart
 * @description 购物车角标数量 store，负责与服务端同步购物车商品数
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { POST } from '@/services/request'

/** 购物车单项最小结构（仅角标计算需要的字段，避免后端结构变更导致全量 type 维护） */
interface CartItem {
  nums: string | number
}

export const useCartStore = defineStore('cart', () => {
  const count = ref<number>(0)

  /**
   * 从服务器同步购物车数量
   * @param busid 用户 ID
   */
  const updateCount = async (busid: number | string): Promise<void> => {
    if (!busid) {
      count.value = 0
      return
    }

    try {
      const result = await POST({ url: '/cart/index', params: { busid } })
      const list = (result.data ?? []) as CartItem[]
      if (result.code === 1 && Array.isArray(list)) {
        count.value = list.reduce((sum, item) => sum + parseInt(String(item.nums), 10), 0)
      } else {
        count.value = 0
      }
    } catch (error) {}
  }

  /** 手动设置数量（本地更新） */
  const setCount = (val: number): void => {
    count.value = val
  }

  /** 清空购物车状态（登出/切号时调用，避免角标残留） */
  const clear = (): void => {
    count.value = 0
  }

  return { count, updateCount, setCount, clear }
})
