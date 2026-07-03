import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed } from 'vue'

/* ---------- mock 依赖（vi.hoisted 确保 mock 变量在 vi.mock 工厂执行前可用） ---------- */

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  addPendingOrder: vi.fn(),
  placeOrder: vi.fn(),
  showFailToast: vi.fn(),
  showSuccessToast: vi.fn(),
  showConfirmDialog: vi.fn(),
  showDialog: vi.fn(),
  post: vi.fn().mockResolvedValue({ code: 1 }),
  updateCount: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mocks.replace })
}))

vi.mock('vant', () => ({
  showFailToast: mocks.showFailToast,
  showSuccessToast: mocks.showSuccessToast,
  showConfirmDialog: mocks.showConfirmDialog,
  showDialog: mocks.showDialog
}))

vi.mock('@/stores/pendingPayment', () => ({
  usePendingPaymentStore: () => ({
    addPendingOrder: mocks.addPendingOrder,
    placeOrder: mocks.placeOrder
  })
}))

vi.mock('@/stores/cart', () => ({
  useCartStore: () => ({
    updateCount: mocks.updateCount
  })
}))

vi.mock('@/services/request', () => ({
  POST: mocks.post
}))

import { useCheckoutSubmit, type CartItem, type AddressItem } from '../useCheckoutSubmit'
import { ORDER_STATUS } from '@/constants/order'

/* ---------- 测试夹具 ---------- */

function setup(
  overrides: {
    cartids?: string
    address?: AddressItem[]
    action?: string
    cartlist?: CartItem[]
  } = {}
) {
  const cartlist = ref<CartItem[]>(
    overrides.cartlist ?? [
      { id: 1, nums: '2', total: 100, price: 50, product: { name: '商品A', thumbs_text: '/a.jpg' } }
    ]
  )
  const address: AddressItem[] = overrides.address ?? [
    {
      id: 10,
      name: '张三',
      tel: '13800000000',
      address: '北京市',
      consignee: '张三',
      mobile: '13800000000',
      address_text: '北京市朝阳区'
    }
  ]
  const cartids = overrides.cartids ?? '1,2'
  const remark = ref('备注信息')
  const action = overrides.action ?? ''
  const totalPrice = computed(() => 100)

  return useCheckoutSubmit({ cartlist, address, cartids, busid: 1, remark, action, totalPrice })
}

describe('useCheckoutSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 默认行为：确认对话框通过、支付失败（各测试按需覆盖）
    mocks.showConfirmDialog.mockResolvedValue(undefined)
    mocks.showDialog.mockResolvedValue(undefined)
    mocks.placeOrder.mockResolvedValue({ success: false })
  })

  /* ========== 前置校验 ========== */

  it('submitting 为 true 时直接返回（防重复提交）', async () => {
    const { submit, submitting } = setup()
    submitting.value = true
    await submit()
    expect(mocks.showConfirmDialog).not.toHaveBeenCalled()
    expect(mocks.addPendingOrder).not.toHaveBeenCalled()
  })

  it('无收货地址时提示并返回', async () => {
    const { submit } = setup({ address: [] })
    await submit()
    expect(mocks.showFailToast).toHaveBeenCalledWith('请先添加或选择收货地址')
    expect(mocks.showConfirmDialog).not.toHaveBeenCalled()
  })

  it('cartids 为空时提示并返回', async () => {
    const { submit } = setup({ cartids: '' })
    await submit()
    expect(mocks.showFailToast).toHaveBeenCalledWith('订单商品信息异常，请返回购物车重试')
    expect(mocks.showConfirmDialog).not.toHaveBeenCalled()
  })

  it('用户取消首次确认对话框时静默返回', async () => {
    mocks.showConfirmDialog.mockRejectedValueOnce(new Error('cancel'))
    const { submit } = setup()
    await submit()
    expect(mocks.addPendingOrder).not.toHaveBeenCalled()
    expect(mocks.placeOrder).not.toHaveBeenCalled()
  })

  /* ========== 稍后支付流程 ========== */

  it('用户稍后支付：暂存订单、提示成功、跳转待付款列表', async () => {
    // 第一次 dialog 确认提交，第二次 dialog 取消（选择稍后支付）
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockRejectedValueOnce(new Error('cancel'))

    const { submit } = setup()
    await submit()

    expect(mocks.addPendingOrder).toHaveBeenCalledTimes(1)
    expect(mocks.showSuccessToast).toHaveBeenCalledWith('您可以稍后继续支付')
    expect(mocks.replace).toHaveBeenCalledWith({
      path: '/order/index',
      query: { status: ORDER_STATUS.PENDING_PAYMENT }
    })
    expect(mocks.placeOrder).not.toHaveBeenCalled()
  })

  /* ========== 立即支付流程 ========== */

  it('立即支付成功：弹窗提示并跳转待发货列表', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined) // 确认提交
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined) // 选择立即支付
    mocks.showDialog.mockResolvedValueOnce(undefined)
    mocks.placeOrder.mockResolvedValueOnce({ success: true, url: '/order/index' })

    const { submit } = setup()
    await submit()

    expect(mocks.placeOrder).toHaveBeenCalledTimes(1)
    expect(mocks.showDialog).toHaveBeenCalledTimes(1)
    expect(mocks.replace).toHaveBeenCalledWith({
      path: '/order/index',
      query: { status: ORDER_STATUS.PENDING_SHIP }
    })
  })

  it('支付失败：提示错误信息并跳转待付款列表', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.placeOrder.mockResolvedValueOnce({ success: false, msg: '库存不足' })

    const { submit } = setup()
    await submit()

    expect(mocks.showFailToast).toHaveBeenCalledWith('库存不足')
    expect(mocks.replace).toHaveBeenCalledWith({
      path: '/order/index',
      query: { status: ORDER_STATUS.PENDING_PAYMENT }
    })
  })

  it('支付失败且无 msg 时使用默认提示', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.placeOrder.mockResolvedValueOnce({ success: false })

    const { submit } = setup()
    await submit()

    expect(mocks.showFailToast).toHaveBeenCalledWith('支付失败，请稍后重试')
  })

  /* ========== submitting 生命周期 ========== */

  it('submit 状态在提交流程完成后恢复为 false', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockRejectedValueOnce(new Error('cancel'))

    const { submit, submitting } = setup()
    expect(submitting.value).toBe(false)

    await submit()

    expect(submitting.value).toBe(false)
  })

  /* ========== PendingOrder 快照 ========== */

  it('PendingOrder 包含正确的商品快照与地址信息', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockRejectedValueOnce(new Error('cancel'))

    const { submit } = setup()
    await submit()

    const pendingOrder = mocks.addPendingOrder.mock.calls[0][0]
    expect(pendingOrder.status).toBe('-2')
    expect(pendingOrder.status_text).toBe('待支付')
    expect(pendingOrder.amount).toBe(100)
    expect(pendingOrder.cartids).toBe('1,2')
    expect(pendingOrder.addrid).toBe(10)
    expect(pendingOrder.remark).toBe('备注信息')
    expect(pendingOrder.item_count).toBe(2)
    expect(pendingOrder.thumbs_text).toBe('/a.jpg')
    expect(pendingOrder.name_text).toBe('商品A')
    expect(pendingOrder.address).toEqual({
      consignee: '张三',
      mobile: '13800000000',
      address_text: '北京市朝阳区'
    })
    expect(pendingOrder.id).toMatch(/^LOCAL_\d+$/)
    expect(pendingOrder.code).toMatch(/^LOCAL[A-Z0-9]+$/)
  })

  it('立即购买模式 action 传入 PendingOrder', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockRejectedValueOnce(new Error('cancel'))

    const { submit } = setup({ action: 'buy' })
    await submit()

    const pendingOrder = mocks.addPendingOrder.mock.calls[0][0]
    expect(pendingOrder.action).toBe('buy')
  })

  it('多商品时 item_count 为 nums 之和', async () => {
    mocks.showConfirmDialog.mockResolvedValueOnce(undefined)
    mocks.showConfirmDialog.mockRejectedValueOnce(new Error('cancel'))

    const { submit } = setup({
      cartlist: [
        { id: 1, nums: '2', total: 100, price: 50 },
        { id: 2, nums: 3, total: 150, price: 50 }
      ]
    })
    await submit()

    const pendingOrder = mocks.addPendingOrder.mock.calls[0][0]
    expect(pendingOrder.item_count).toBe(5) // 2 + 3
  })
})
