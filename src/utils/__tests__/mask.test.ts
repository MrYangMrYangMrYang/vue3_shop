import { describe, it, expect } from 'vitest'
import { maskMobile } from '../mask'

describe('maskMobile', () => {
  it('标准 11 位手机号脱敏为 138****5678', () => {
    expect(maskMobile('13812345678')).toBe('138****5678')
  })

  it('空值返回空字符串', () => {
    expect(maskMobile('')).toBe('')
    expect(maskMobile(null)).toBe('')
    expect(maskMobile(undefined)).toBe('')
    expect(maskMobile(0)).toBe('')
    expect(maskMobile(false)).toBe('')
  })

  it('非 1 开头的手机号原样返回', () => {
    expect(maskMobile('23812345678')).toBe('23812345678')
  })

  it('位数不足 11 位原样返回', () => {
    expect(maskMobile('1381234')).toBe('1381234')
    expect(maskMobile('1')).toBe('1')
  })

  it('位数超过 11 位原样返回', () => {
    expect(maskMobile('138123456789')).toBe('138123456789')
  })

  it('带空白的手机号先 trim 再脱敏', () => {
    expect(maskMobile('  13812345678  ')).toBe('138****5678')
    expect(maskMobile('\t13812345678\n')).toBe('138****5678')
  })

  it('数字类型入参转字符串后脱敏', () => {
    expect(maskMobile(13812345678)).toBe('138****5678')
  })

  it('非标准数字入参转字符串后原样返回', () => {
    expect(maskMobile(12345)).toBe('12345')
  })

  it('对象/数组等非字符串入参转字符串后原样返回', () => {
    expect(maskMobile({ a: 1 })).toBe('[object Object]')
    expect(maskMobile([1, 2, 3])).toBe('1,2,3')
  })
})
