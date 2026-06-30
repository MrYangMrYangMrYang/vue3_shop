/**
 * @fileoverview useCartBadge hook 单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartBadge } from '../useCartBadge'
import { useCartStore } from '@/stores/cart'
import { usePendingPaymentStore, type PendingOrder } from '@/stores/pendingPayment'

/** 构造待支付订单（item_count 决定占用件数） */
const makeOrder = (overrides: Partial<PendingOrder> & { id?: string | number } = {}): PendingOrder => ({
  id: 1,
  createtime: Date.now(),
  name_text: '商品A',
  thumbs_text: '/img/a.png',
  amount: 50,
  code: 'TEST',
  cartids: '1,2',
  addrid: 10,
  item_count: 2,
  ...overrides
})

describe('useCartBadge', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('无待付款订单时 badge 等于购物车总数', () => {
    const cartStore = useCartStore()
    cartStore.setCount(5)
    const badge = useCartBadge()
    expect(badge.value).toBe(5)
  })

  it('有待付款订单时 badge 扣除占用件数', () => {
    const cartStore = useCartStore()
    const pendingStore = usePendingPaymentStore()
    cartStore.setCount(10)
    pendingStore.addPendingOrder(makeOrder({ id: 1, item_count: 3 }))

    const badge = useCartBadge()
    expect(badge.value).toBe(7)
  })

  it('占用件数超过购物车总数时 badge 不低于 0', () => {
    const cartStore = useCartStore()
    const pendingStore = usePendingPaymentStore()
    cartStore.setCount(2)
    pendingStore.addPendingOrder(makeOrder({ id: 1, item_count: 5 }))

    const badge = useCartBadge()
    expect(badge.value).toBe(0)
  })

  it('cartStore.count 变化时 badge 响应式更新', () => {
    const cartStore = useCartStore()
    const badge = useCartBadge()

    cartStore.setCount(8)
    expect(badge.value).toBe(8)

    cartStore.setCount(3)
    expect(badge.value).toBe(3)
  })

  it('待付款订单增减时 badge 响应式更新', () => {
    const cartStore = useCartStore()
    const pendingStore = usePendingPaymentStore()
    cartStore.setCount(10)
    const badge = useCartBadge()

    expect(badge.value).toBe(10)

    pendingStore.addPendingOrder(makeOrder({ id: 1, item_count: 4 }))
    expect(badge.value).toBe(6)

    pendingStore.removePendingOrder(1)
    expect(badge.value).toBe(10)
  })

  it('多笔待付款订单占用件数累加', () => {
    const cartStore = useCartStore()
    const pendingStore = usePendingPaymentStore()
    cartStore.setCount(20)
    pendingStore.addPendingOrder(makeOrder({ id: 1, item_count: 3 }))
    pendingStore.addPendingOrder(makeOrder({ id: 2, item_count: 5 }))

    const badge = useCartBadge()
    expect(badge.value).toBe(12)
  })
})
