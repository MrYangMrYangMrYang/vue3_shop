import { describe, it, expect, vi } from 'vitest'
import { debounce } from '../debounce'

describe('debounce', () => {
  it('延迟执行目标函数', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('连续调用只执行最后一次', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    debounced('b')
    debounced('c')

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
    vi.useRealTimers()
  })

  it('传递参数到目标函数', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced(1, 2, 3)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith(1, 2, 3)
    vi.useRealTimers()
  })

  it('间隔内重新调用重置计时器', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()

    debounced()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('默认延迟 300ms', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn)

    debounced()
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
