import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCompletedLocalOrdersStore } from '../completedLocalOrders'

const STORAGE_KEY = 'completed_local_orders'

const makeOrder = (overrides: Partial<Record<string, unknown>> & { id?: string | number } = {}) => ({
  id: 1,
  status: 2,
  status_text: '待发货',
  status_class: 'status-2',
  name_text: '商品A',
  thumbs_text: 'http://img/a.png',
  amount: 99.5,
  createtime: 1700000000000,
  ...overrides
})

describe('completedLocalOrders store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('addCompletedOrder', () => {
    it('添加订单后出现在列表首位', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].id).toBe(1)
    })

    it('添加时自动标记 _isLocalCompleted', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      expect(store.orders[0]._isLocalCompleted).toBe(true)
    })

    it('相同 id 订单不重复添加', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1, status_text: '待发货' }))
      store.addCompletedOrder(makeOrder({ id: 1, status_text: '已完成' }))
      expect(store.orders).toHaveLength(1)
      // 首次写入保留，后续同 id 被忽略
      expect(store.orders[0].status_text).toBe('待发货')
    })

    it('不同 id 订单均可添加', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      store.addCompletedOrder(makeOrder({ id: 2 }))
      expect(store.orders).toHaveLength(2)
    })

    it('缺少 id 的订单被跳过', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder({ status: 2, name_text: '无id' } as never)
      expect(store.orders).toHaveLength(0)
    })

    it('null/undefined 入参不报错', () => {
      const store = useCompletedLocalOrdersStore()
      expect(() => store.addCompletedOrder(null as never)).not.toThrow()
      expect(() => store.addCompletedOrder(undefined as never)).not.toThrow()
      expect(store.orders).toHaveLength(0)
    })
  })

  describe('持久化', () => {
    it('添加后写入 localStorage', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw as string)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe(1)
      expect(parsed[0]._isLocalCompleted).toBe(true)
    })

    it('初始化时从 localStorage 恢复', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 9, status: 3, _isLocalCompleted: true }]))
      const store = useCompletedLocalOrdersStore()
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].id).toBe(9)
    })

    it('损坏的 localStorage 数据降级为空列表', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json')
      const store = useCompletedLocalOrdersStore()
      expect(store.orders).toHaveLength(0)
    })
  })

  describe('getAllOrders', () => {
    it('返回全部订单', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      store.addCompletedOrder(makeOrder({ id: 2 }))
      expect(store.getAllOrders()).toHaveLength(2)
    })

    it('空列表返回空数组', () => {
      const store = useCompletedLocalOrdersStore()
      expect(store.getAllOrders()).toEqual([])
    })
  })

  describe('getOrderByStatus', () => {
    it('按状态筛选订单（数字 status）', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1, status: 2 }))
      store.addCompletedOrder(makeOrder({ id: 2, status: 3 }))
      store.addCompletedOrder(makeOrder({ id: 3, status: 2 }))
      expect(store.getOrderByStatus(2)).toHaveLength(2)
      expect(store.getOrderByStatus(3)).toHaveLength(1)
    })

    it('字符串与数字 status 等价比较', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1, status: 2 }))
      expect(store.getOrderByStatus('2')).toHaveLength(1)
    })

    it('无匹配返回空数组', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1, status: 2 }))
      expect(store.getOrderByStatus(99)).toEqual([])
    })
  })

  describe('removeOrder', () => {
    it('移除已存在的订单', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      store.addCompletedOrder(makeOrder({ id: 2 }))
      store.removeOrder(1)
      expect(store.orders).toHaveLength(1)
      expect(store.orders[0].id).toBe(2)
    })

    it('移除后同步更新 localStorage', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      store.removeOrder(1)
      const raw = localStorage.getItem(STORAGE_KEY)
      expect(JSON.parse(raw as string)).toEqual([])
    })

    it('移除不存在的订单不报错', () => {
      const store = useCompletedLocalOrdersStore()
      expect(() => store.removeOrder(999)).not.toThrow()
    })
  })

  describe('clearAll', () => {
    it('清空所有订单', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      store.addCompletedOrder(makeOrder({ id: 2 }))
      store.clearAll()
      expect(store.orders).toHaveLength(0)
      expect(store.getAllOrders()).toEqual([])
    })

    it('清空后移除 localStorage 键', () => {
      const store = useCompletedLocalOrdersStore()
      store.addCompletedOrder(makeOrder({ id: 1 }))
      store.clearAll()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })
})
