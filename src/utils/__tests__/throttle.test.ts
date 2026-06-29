import { describe, it, expect, vi } from 'vitest'
import { throttle } from '../throttle'

describe('throttle', () => {
  it('leading=true 立即执行首次调用', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 300)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('leading=false 首次调用延迟执行', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 300, false)

    throttled()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('窗口内重复调用只执行一次', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 300)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('传递参数到目标函数', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('a', 'b')
    expect(fn).toHaveBeenCalledWith('a', 'b')
    vi.useRealTimers()
  })

  it('窗口结束后可再次触发', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 300)

    throttled()
    vi.advanceTimersByTime(300)
    throttled()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})
