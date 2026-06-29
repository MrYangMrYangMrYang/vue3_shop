import { describe, it, expect } from 'vitest'
import { toNumber, roundToTwo, toFen, formatCurrency } from '../currency'

describe('toNumber', () => {
  it('数字原样返回', () => {
    expect(toNumber(123)).toBe(123)
    expect(toNumber(0)).toBe(0)
    expect(toNumber(-1.5)).toBe(-1.5)
  })

  it('数字字符串转换为数字', () => {
    expect(toNumber('123')).toBe(123)
    expect(toNumber('0')).toBe(0)
    expect(toNumber('12.34')).toBe(12.34)
  })

  it('无效值返回 0', () => {
    expect(toNumber('abc')).toBe(0)
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
    expect(toNumber(NaN)).toBe(0)
    expect(toNumber(Infinity)).toBe(0)
    expect(toNumber({})).toBe(0)
  })
})

describe('roundToTwo', () => {
  it('四舍五入保留两位', () => {
    expect(roundToTwo(1.005)).toBe(1.01)
    expect(roundToTwo(1.004)).toBe(1)
    expect(roundToTwo(2.345)).toBe(2.35)
    expect(roundToTwo(2.344)).toBe(2.34)
  })

  it('整数和小数不变', () => {
    expect(roundToTwo(100)).toBe(100)
    expect(roundToTwo(9.99)).toBe(9.99)
  })

  it('无效输入返回 0', () => {
    expect(roundToTwo('abc')).toBe(0)
    expect(roundToTwo(null)).toBe(0)
  })
})

describe('toFen', () => {
  it('元转分（乘 100 取整）', () => {
    expect(toFen(1)).toBe(100)
    expect(toFen(1.5)).toBe(150)
    expect(toFen(0.01)).toBe(1)
    expect(toFen(9.99)).toBe(999)
  })

  it('四舍五入处理浮点误差', () => {
    expect(toFen(1.005)).toBe(101)
    expect(toFen(2.345)).toBe(235)
  })

  it('无效输入返回 0', () => {
    expect(toFen('abc')).toBe(0)
    expect(toFen(null)).toBe(0)
  })
})

describe('formatCurrency', () => {
  it('默认两位小数', () => {
    expect(formatCurrency(100)).toBe('100.00')
    expect(formatCurrency(9.999)).toBe('10.00')
    expect(formatCurrency(0)).toBe('0.00')
  })

  it('自定义小数位数', () => {
    expect(formatCurrency(100, 0)).toBe('100')
    expect(formatCurrency(9.999, 1)).toBe('10.0')
    expect(formatCurrency(9.999, 3)).toBe('10.000')
  })

  it('无效输入格式化为 0.00', () => {
    expect(formatCurrency('abc')).toBe('0.00')
    expect(formatCurrency(null)).toBe('0.00')
  })
})
