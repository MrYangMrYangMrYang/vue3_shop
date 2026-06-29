import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatDateOnly } from '../date'

describe('formatDate', () => {
  it('默认模板 YYYY-MM-DD HH:mm:ss', () => {
    const date = new Date(2026, 0, 15, 14, 30, 45)
    expect(formatDate(date)).toBe('2026-01-15 14:30:45')
  })

  it('自定义模板', () => {
    const date = new Date(2026, 5, 1, 9, 5, 3)
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2026/06/01')
    expect(formatDate(date, 'HH:mm')).toBe('09:05')
    expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2026年06月01日')
  })

  it('补零到两位', () => {
    const date = new Date(2026, 0, 1, 1, 2, 3)
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-01-01 01:02:03')
  })

  it('接受时间戳和字符串', () => {
    const ts = new Date(2026, 0, 1).getTime()
    expect(formatDate(ts, 'YYYY-MM-DD')).toBe('2026-01-01')
    expect(formatDate('2026-01-01T00:00:00', 'YYYY-MM-DD')).toBe('2026-01-01')
  })

  it('默认参数为当前时间', () => {
    const result = formatDate(new Date(), 'YYYY')
    expect(result).toBe(String(new Date().getFullYear()))
  })

  it('无效日期返回空字符串', () => {
    expect(formatDate('invalid', 'YYYY-MM-DD')).toBe('')
  })

  it('null/undefined 视为当前时间', () => {
    expect(formatDate(null, 'YYYY')).toBe(String(new Date().getFullYear()))
    expect(formatDate(undefined, 'YYYY')).toBe(String(new Date().getFullYear()))
  })
})

describe('formatDateTime', () => {
  it('格式化为 YYYY-MM-DD HH:mm:ss', () => {
    const date = new Date(2026, 11, 31, 23, 59, 59)
    expect(formatDateTime(date)).toBe('2026-12-31 23:59:59')
  })
})

describe('formatDateOnly', () => {
  it('格式化为 YYYY-MM-DD', () => {
    const date = new Date(2026, 5, 29)
    expect(formatDateOnly(date)).toBe('2026-06-29')
  })
})
