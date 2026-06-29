import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRemainingTime, isPaymentExpired, formatCountdown } from '../countdown'

describe('getRemainingTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('返回剩余毫秒数', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const createtime = new Date('2026-01-01T00:00:00Z').getTime()
    const timeoutMs = 30 * 60 * 1000
    expect(getRemainingTime(createtime, timeoutMs)).toBe(timeoutMs)
  })

  it('已过部分时间返回差值', () => {
    vi.setSystemTime(new Date('2026-01-01T00:10:00Z'))
    const createtime = new Date('2026-01-01T00:00:00Z').getTime()
    const timeoutMs = 30 * 60 * 1000
    expect(getRemainingTime(createtime, timeoutMs)).toBe(20 * 60 * 1000)
  })

  it('超时返回 0', () => {
    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'))
    const createtime = new Date('2026-01-01T00:00:00Z').getTime()
    expect(getRemainingTime(createtime, 30 * 60 * 1000)).toBe(0)
  })

  it('无效创建时间返回 0', () => {
    expect(getRemainingTime('invalid')).toBe(0)
    expect(getRemainingTime(null)).toBe(0)
    expect(getRemainingTime(undefined)).toBe(0)
  })
})

describe('isPaymentExpired', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('未超时返回 false', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const createtime = new Date('2026-01-01T00:00:00Z').getTime()
    expect(isPaymentExpired(createtime, 30 * 60 * 1000)).toBe(false)
  })

  it('超时返回 true', () => {
    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'))
    const createtime = new Date('2026-01-01T00:00:00Z').getTime()
    expect(isPaymentExpired(createtime, 30 * 60 * 1000)).toBe(true)
  })

  it('无效时间视为已过期', () => {
    expect(isPaymentExpired('invalid')).toBe(true)
    expect(isPaymentExpired(null)).toBe(true)
  })
})

describe('formatCountdown', () => {
  it('零或负数返回 00:00', () => {
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(-100)).toBe('00:00')
  })

  it('分钟以内显示 MM:SS', () => {
    expect(formatCountdown(5000)).toBe('00:05')
    expect(formatCountdown(59000)).toBe('00:59')
  })

  it('分钟段显示 MM:SS', () => {
    expect(formatCountdown(65 * 1000)).toBe('01:05')
    expect(formatCountdown(59 * 60 * 1000 + 59 * 1000)).toBe('59:59')
  })

  it('一小时以上显示 HH:MM:SS', () => {
    expect(formatCountdown(60 * 60 * 1000)).toBe('01:00:00')
    expect(formatCountdown(90 * 60 * 1000 + 30 * 1000)).toBe('01:30:30')
  })
})
