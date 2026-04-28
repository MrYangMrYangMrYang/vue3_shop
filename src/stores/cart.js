import { defineStore } from 'pinia'
import { ref } from 'vue'
import { POST } from '@/services/request'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)

  /**
   * 从服务器同步购物车数量
   * @param {number} busid 用户ID
   */
  const updateCount = async (busid) => {
    if (!busid) { count.value = 0; return }

    try {
      const result = await POST({ url: '/cart/index', params: { busid } })
      if (result.code === 1 && Array.isArray(result.data)) {
        count.value = result.data.reduce((sum, item) => sum + parseInt(item.nums), 0)
      } else {
        count.value = 0
      }
    } catch (error) {}
  }

  /** 手动设置数量（本地更新） */
  const setCount = (val) => { count.value = val }

  return { count, updateCount, setCount }
})
