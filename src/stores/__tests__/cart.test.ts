/**
 * @fileoverview cart store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '../cart'
import { POST } from '@/services/request'
import type { ApiResult } from '@/services/request'

vi.mock('@/services/request')

const mockedPOST = vi.mocked(POST)

/** 构造 /cart/index 成功响应 */
const makeCartResponse = (items: { nums: number | string }[]): ApiResult => ({
  code: 1,
  msg: 'success',
  data: items
})

describe('cart store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初始 count 为 0', () => {
    const store = useCartStore()
    expect(store.count).toBe(0)
  })

  it('setCount 设置购物车数量', () => {
    const store = useCartStore()
    store.setCount(5)
    expect(store.count).toBe(5)
  })

  it('clear 清零购物车数量', () => {
    const store = useCartStore()
    store.setCount(8)
    store.clear()
    expect(store.count).toBe(0)
  })

  describe('updateCount', () => {
    it('busid 为 0 时直接清零不请求', async () => {
      const store = useCartStore()
      store.setCount(10)
      await store.updateCount(0)
      expect(store.count).toBe(0)
      expect(mockedPOST).not.toHaveBeenCalled()
    })

    it('成功响应时按 nums 求和', async () => {
      mockedPOST.mockResolvedValueOnce(makeCartResponse([{ nums: 2 }, { nums: 3 }, { nums: '4' }]))
      const store = useCartStore()
      await store.updateCount(100)
      expect(store.count).toBe(9)
      expect(mockedPOST).toHaveBeenCalledWith({ url: '/cart/index', params: { busid: 100 } })
    })

    it('code 非 1 时 count 归零', async () => {
      mockedPOST.mockResolvedValueOnce({ code: 0, msg: '未登录', data: null } as ApiResult)
      const store = useCartStore()
      store.setCount(5)
      await store.updateCount(100)
      expect(store.count).toBe(0)
    })

    it('data 非数组时 count 归零', async () => {
      mockedPOST.mockResolvedValueOnce({ code: 1, msg: 'ok', data: null } as ApiResult)
      const store = useCartStore()
      store.setCount(5)
      await store.updateCount(100)
      expect(store.count).toBe(0)
    })

    it('请求异常时 count 保持原值（catch 静默）', async () => {
      mockedPOST.mockRejectedValueOnce(new Error('network error'))
      const store = useCartStore()
      store.setCount(7)
      await store.updateCount(100)
      expect(store.count).toBe(7)
    })
  })
})
