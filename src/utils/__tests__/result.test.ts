import { describe, it, expect } from 'vitest'
import { getResultCode, isBizSuccess, isBizFail } from '../result'

describe('getResultCode', () => {
  it('提取 code 字段并转数字', () => {
    expect(getResultCode({ code: 1 })).toBe(1)
    expect(getResultCode({ code: 0 })).toBe(0)
    expect(getResultCode({ code: '1' })).toBe(1)
  })

  it('缺失 code 返回 -1', () => {
    expect(getResultCode({})).toBe(-1)
    expect(getResultCode(null)).toBe(-1)
    expect(getResultCode(undefined)).toBe(-1)
  })
})

describe('isBizSuccess', () => {
  it('code=1 为成功', () => {
    expect(isBizSuccess({ code: 1, data: 'ok' })).toBe(true)
    expect(isBizSuccess({ code: '1' })).toBe(true)
  })

  it('非 1 为失败', () => {
    expect(isBizSuccess({ code: 0 })).toBe(false)
    expect(isBizSuccess({ code: 2 })).toBe(false)
    expect(isBizSuccess({})).toBe(false)
    expect(isBizSuccess(null)).toBe(false)
  })
})

describe('isBizFail', () => {
  it('code=0 为失败', () => {
    expect(isBizFail({ code: 0, msg: 'error' })).toBe(true)
    expect(isBizFail({ code: '0' })).toBe(true)
  })

  it('非 0 为非失败', () => {
    expect(isBizFail({ code: 1 })).toBe(false)
    expect(isBizFail({ code: 2 })).toBe(false)
    expect(isBizFail({})).toBe(false)
    expect(isBizFail(null)).toBe(false)
  })
})
