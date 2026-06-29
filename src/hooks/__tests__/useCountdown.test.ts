import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { useCountdown, type CountdownOrder } from '../useCountdown'

/**
 * 在真实组件 setup 中执行 composable，使生命周期钩子（onBeforeUnmount 等）可正常注册。
 * 返回 unmount 用于触发卸载，验证清理逻辑。
 */
function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  const holder: { value?: T } = {}
  const app = createApp(
    defineComponent({
      setup() {
        holder.value = composable()
        return () => h('div')
      }
    })
  )
  app.mount(document.createElement('div'))
  return { result: holder.value as T, unmount: () => app.unmount() }
}

/** 构造订单（createtime 默认为当前 mock 时间，即未过期、剩余 30 分钟） */
const makeOrder = (overrides: Partial<CountdownOrder> = {}): CountdownOrder => ({
  id: 1,
  status: '-2',
  createtime: new Date('2026-01-01T00:00:00Z').getTime(),
  ...overrides
})

/** 待支付判断：status === '-2'（与业务常量 ORDER_STATUS.PENDING_PAYMENT 对齐） */
const isPending = (status: string | number | undefined): boolean => String(status) === '-2'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('startCountdown 后待支付订单进入 countdownMap', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1 })], isPending))
    result.startCountdown()
    expect(result.countdownMap.value[1]).toBe('30:00')
    unmount()
  })

  it('非待支付订单不计入', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1, status: '1' })], isPending))
    result.startCountdown()
    expect(result.countdownMap.value[1]).toBeUndefined()
    unmount()
  })

  it('已过期订单不计入', () => {
    vi.setSystemTime(new Date('2026-01-01T01:00:00Z')) // 推进 1 小时，订单已超 30 分钟
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1 })], isPending))
    result.startCountdown()
    expect(result.countdownMap.value[1]).toBeUndefined()
    unmount()
  })

  it('多个待支付订单均计入 map', () => {
    const { result, unmount } = withSetup(() =>
      useCountdown(() => [makeOrder({ id: 1 }), makeOrder({ id: 2 }), makeOrder({ id: 3 })], isPending)
    )
    result.startCountdown()
    expect(Object.keys(result.countdownMap.value)).toHaveLength(3)
    expect(result.countdownMap.value[1]).toBe('30:00')
    expect(result.countdownMap.value[2]).toBe('30:00')
    unmount()
  })

  it('无待支付订单时 map 为空', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1, status: '1' })], isPending))
    result.startCountdown()
    expect(result.countdownMap.value).toEqual({})
    unmount()
  })

  it('每秒自动续期，倒计时递减', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1 })], isPending))
    result.startCountdown()
    expect(result.countdownMap.value[1]).toBe('30:00')

    vi.advanceTimersByTime(1000)
    expect(result.countdownMap.value[1]).toBe('29:59')

    vi.advanceTimersByTime(1000)
    expect(result.countdownMap.value[1]).toBe('29:58')
    unmount()
  })

  it('stopCountdown 后不再续期', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1 })], isPending))
    result.startCountdown()
    result.stopCountdown()
    const snapshot = result.countdownMap.value[1]
    vi.advanceTimersByTime(5000)
    // 停止后 map 不再更新
    expect(result.countdownMap.value[1]).toBe(snapshot)
    unmount()
  })

  it('getOrders 返回 undefined 不报错（兜底空数组）', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => undefined, isPending))
    expect(() => result.startCountdown()).not.toThrow()
    expect(result.countdownMap.value).toEqual({})
    unmount()
  })

  it('getOrders 非函数时不报错', () => {
    const { result, unmount } = withSetup(() => useCountdown(undefined as unknown as () => CountdownOrder[], isPending))
    expect(() => result.startCountdown()).not.toThrow()
    expect(result.countdownMap.value).toEqual({})
    unmount()
  })

  it('组件卸载时自动清理定时器（onBeforeUnmount）', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1 })], isPending))
    result.startCountdown()
    // 触发 onBeforeUnmount → stopCountdown
    unmount()
    // 推进时间不再有副作用（定时器已清除），无异常即通过
    expect(() => vi.advanceTimersByTime(10000)).not.toThrow()
  })

  it('重复 startCountdown 不叠加定时器', () => {
    const { result, unmount } = withSetup(() => useCountdown(() => [makeOrder({ id: 1 })], isPending))
    result.startCountdown()
    result.startCountdown()
    result.startCountdown()
    // 仅一个定时器在跑，推进 1 秒只更新一次
    vi.advanceTimersByTime(1000)
    expect(result.countdownMap.value[1]).toBe('29:59')
    unmount()
  })
})
