import { describe, it, expect } from 'vitest'
import {
  MOBILE_PATTERN,
  EMAIL_PATTERN,
  SMS_CODE_PATTERN,
  PASSWORD_PATTERN,
  isMobile,
  isEmail,
  isSmsCode,
  isPassword
} from '../validate'

describe('isMobile', () => {
  it('合法手机号', () => {
    expect(isMobile('13800138000')).toBe(true)
    expect(isMobile('15012345678')).toBe(true)
    expect(isMobile('19912345678')).toBe(true)
    expect(isMobile('17012345678')).toBe(true)
  })

  it('非法手机号', () => {
    expect(isMobile('12345678901')).toBe(false)
    expect(isMobile('1380013800')).toBe(false)
    expect(isMobile('23800138000')).toBe(false)
    expect(isMobile('')).toBe(false)
    expect(isMobile(null)).toBe(false)
  })

  it('带空白的手机号会被 trim 后校验', () => {
    expect(isMobile('  13800138000  ')).toBe(true)
  })

  it('MOBILE_PATTERN 可直接用于表单校验', () => {
    expect(MOBILE_PATTERN.test('13800138000')).toBe(true)
    expect(MOBILE_PATTERN.test('12345')).toBe(false)
  })
})

describe('isEmail', () => {
  it('合法邮箱', () => {
    expect(isEmail('test@example.com')).toBe(true)
    expect(isEmail('user.name@domain.cn')).toBe(true)
    expect(isEmail('a_b-c@sub.domain.org')).toBe(true)
  })

  it('非法邮箱', () => {
    expect(isEmail('not-an-email')).toBe(false)
    expect(isEmail('missing@domain')).toBe(false)
    expect(isEmail('@domain.com')).toBe(false)
    expect(isEmail('')).toBe(false)
    expect(isEmail(null)).toBe(false)
  })
})

describe('isSmsCode', () => {
  it('6 位数字', () => {
    expect(isSmsCode('123456')).toBe(true)
    expect(isSmsCode('000000')).toBe(true)
  })

  it('非 6 位数字', () => {
    expect(isSmsCode('12345')).toBe(false)
    expect(isSmsCode('1234567')).toBe(false)
    expect(isSmsCode('abcdef')).toBe(false)
    expect(isSmsCode('')).toBe(false)
    expect(isSmsCode(null)).toBe(false)
  })
})

describe('isPassword', () => {
  it('6 位以上', () => {
    expect(isPassword('123456')).toBe(true)
    expect(isPassword('abcdef')).toBe(true)
    expect(isPassword('!@#$%^')).toBe(true)
    expect(isPassword('a1b2c3d4')).toBe(true)
  })

  it('6 位以下', () => {
    expect(isPassword('12345')).toBe(false)
    expect(isPassword('')).toBe(false)
    expect(isPassword(null)).toBe(false)
  })
})

describe('正则常量可直接用于表单 pattern', () => {
  it('EMAIL_PATTERN', () => {
    expect(EMAIL_PATTERN.test('a@b.com')).toBe(true)
    expect(EMAIL_PATTERN.test('invalid')).toBe(false)
  })

  it('SMS_CODE_PATTERN', () => {
    expect(SMS_CODE_PATTERN.test('123456')).toBe(true)
    expect(SMS_CODE_PATTERN.test('12')).toBe(false)
  })

  it('PASSWORD_PATTERN', () => {
    expect(PASSWORD_PATTERN.test('secret')).toBe(true)
    expect(PASSWORD_PATTERN.test('123')).toBe(false)
  })
})
