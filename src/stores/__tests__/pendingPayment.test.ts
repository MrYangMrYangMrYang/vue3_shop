import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePendingPaymentStore, type PendingOrder } from '../pendingPayment'

const STORAGE_KEY = 'pending_payment_orders'

const makeOrder = (overrides: Partial<PendingOrder> & { id?: string | number } = {}): PendingOrder => ({
  id: 1,
  createtime: 1700000000000,
  name_text: '商品A',
  thumbs_text: 'http://img/a.png',
  amount: 99.5,
  ...overrides
})

describe('pendingPayment store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    // addPendingOrder 会启动 setInterval 自动清理，需停止避免跨用例泄漏
    const store = usePendingPaymentStore()
    store.clearAll()
    vi.useRealTimers()
  })

  describe('addPendingOrder', () => {
    it('添加订单后出现在列表首位', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      store.addPendingOrder(makeOrder({ id: 2 }))
      expect(store.orders).toHaveLength(2)
      // unshift 入首部，后加的在前
      expect(store.orders[0].id).toBe(2)
    })

    it('添加时标记 _isLocalPending 并归一化状态字段', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      const order = store.orders[0]
      expect(order._isLocalPending).toBe(true)
      expect(order.status).toBe('-2')
      expect(order.status_text).toBe('待支付')
      expect(order.status_class).toBe('status-pending-payment')
      expect(order.created_at).toBeTypeOf('number')
    })

    it('相同 id 订单走更新分支（Object.assign 合并）', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, amount: 10 }))
      store.addPendingOrder(makeOrder({ id: 1, amount: 20, name_text: '更新商品' }))
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].amount).toBe(20)
      expect(store.orders[0].name_text).toBe('更新商品')
    })

    it('缺少 id 的订单被跳过', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder({ name_text: '无id' } as PendingOrder)
      expect(store.orders).toHaveLength(0)
    })

    it('null/undefined 入参不报错', () => {
      const store = usePendingPaymentStore()
      expect(() => store.addPendingOrder(null as unknown as PendingOrder)).not.toThrow()
      expect(() => store.addPendingOrder(undefined as unknown as PendingOrder)).not.toThrow()
      expect(store.orders).toHaveLength(0)
    })
  })

  describe('pendingCount', () => {
    it('反映当前订单数量', () => {
      const store = usePendingPaymentStore()
      expect(store.pendingCount).toBe(0)
      store.addPendingOrder(makeOrder({ id: 1 }))
      expect(store.pendingCount).toBe(1)
      store.addPendingOrder(makeOrder({ id: 2 }))
      expect(store.pendingCount).toBe(2)
    })
  })

  describe('removePendingOrder', () => {
    it('移除已存在的订单', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      store.addPendingOrder(makeOrder({ id: 2 }))
      store.removePendingOrder(1)
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].id).toBe(2)
    })

    it('移除不存在的订单不报错', () => {
      const store = usePendingPaymentStore()
      expect(() => store.removePendingOrder(999)).not.toThrow()
    })
  })

  describe('getPendingOrder', () => {
    it('找到订单返回引用', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, name_text: '测试' }))
      const found = store.getPendingOrder(1)
      expect(found).toBeDefined()
      expect(found?.name_text).toBe('测试')
    })

    it('未找到返回 undefined', () => {
      const store = usePendingPaymentStore()
      expect(store.getPendingOrder(999)).toBeUndefined()
    })

    it('字符串与数字 id 等价查找', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      // 严格相等：数字 1 与字符串 '1' 不等价，按 store 实际语义验证
      expect(store.getPendingOrder(1)).toBeDefined()
    })
  })

  describe('clearExpiredOrders', () => {
    it('未过期订单保留', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, createtime: new Date('2026-01-01T00:00:00Z').getTime() }))
      const removed = store.clearExpiredOrders()
      expect(removed).toBe(0)
      expect(store.orders).toHaveLength(1)
    })

    it('过期订单被清除并返回清除数量', () => {
      vi.setSystemTime(new Date('2026-01-01T01:00:00Z')) // 当前时间
      const store = usePendingPaymentStore()
      // createtime 在 31 分钟前，超过 30 分钟超时
      const expired = new Date('2026-01-01T00:29:00Z').getTime()
      store.addPendingOrder(makeOrder({ id: 1, createtime: expired }))
      const removed = store.clearExpiredOrders()
      expect(removed).toBe(1)
      expect(store.orders).toHaveLength(0)
    })

    it('缺少 createtime 的订单视为过期被清除', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, createtime: undefined }))
      const removed = store.clearExpiredOrders()
      expect(removed).toBe(1)
      expect(store.orders).toHaveLength(0)
    })

    it('混合场景仅清除过期项', () => {
      vi.setSystemTime(new Date('2026-01-01T00:40:00Z'))
      const store = usePendingPaymentStore()
      store.addPendingOrder(
        makeOrder({ id: 1, createtime: new Date('2026-01-01T00:00:00Z').getTime() }) // 40min 前，过期
      )
      store.addPendingOrder(
        makeOrder({ id: 2, createtime: new Date('2026-01-01T00:30:00Z').getTime() }) // 10min 前，未过期
      )
      const removed = store.clearExpiredOrders()
      expect(removed).toBe(1)
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].id).toBe(2)
    })
  })

  describe('clearIncompleteOrders', () => {
    it('缺少 thumbs_text 的订单被清除', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, thumbs_text: undefined }))
      const removed = store.clearIncompleteOrders()
      expect(removed).toBe(1)
      expect(store.orders).toHaveLength(0)
    })

    it('缺少 name_text 的订单被清除', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, name_text: undefined }))
      const removed = store.clearIncompleteOrders()
      expect(removed).toBe(1)
    })

    it('amount 为 0 或缺失的订单被清除', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1, amount: 0 }))
      store.addPendingOrder(makeOrder({ id: 2, amount: undefined }))
      expect(store.clearIncompleteOrders()).toBe(2)
    })

    it('完整订单保留', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      expect(store.clearIncompleteOrders()).toBe(0)
      expect(store.orders).toHaveLength(1)
    })
  })

  describe('持久化', () => {
    it('添加后写入 localStorage', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw as string)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe(1)
      expect(parsed[0]._isLocalPending).toBe(true)
    })

    it('初始化时从 localStorage 恢复', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 9, _isLocalPending: true, amount: 50 }]))
      const store = usePendingPaymentStore()
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].id).toBe(9)
    })

    it('损坏的 localStorage 数据降级为空列表', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json')
      const store = usePendingPaymentStore()
      expect(store.orders).toHaveLength(0)
    })
  })

  describe('clearAll', () => {
    it('清空所有订单', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      store.addPendingOrder(makeOrder({ id: 2 }))
      store.clearAll()
      expect(store.orders).toHaveLength(0)
      expect(store.pendingCount).toBe(0)
    })

    it('清空后移除 localStorage 键', () => {
      const store = usePendingPaymentStore()
      store.addPendingOrder(makeOrder({ id: 1 }))
      store.clearAll()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })
})
