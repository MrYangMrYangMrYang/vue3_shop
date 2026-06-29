import { describe, it, expect } from 'vitest'
import { normalizeIdList, getRouteQueryValue } from '../params'

describe('normalizeIdList', () => {
  it('数组转逗号分隔字符串', () => {
    expect(normalizeIdList([1, 2, 3])).toBe('1,2,3')
    expect(normalizeIdList(['a', 'b'])).toBe('a,b')
  })

  it('过滤数组中的空值', () => {
    expect(normalizeIdList([1, null, 2, undefined, 3, ''])).toBe('1,2,3')
    expect(normalizeIdList([null, undefined, ''])).toBe('')
  })

  it('空数组返回空字符串', () => {
    expect(normalizeIdList([])).toBe('')
  })

  it('单个值转字符串并 trim', () => {
    expect(normalizeIdList(123)).toBe('123')
    expect(normalizeIdList('  abc  ')).toBe('abc')
    expect(normalizeIdList(0)).toBe('0')
  })

  it('null/undefined 返回空字符串', () => {
    expect(normalizeIdList(null)).toBe('')
    expect(normalizeIdList(undefined)).toBe('')
  })
})

describe('getRouteQueryValue', () => {
  it('获取存在的 key', () => {
    expect(getRouteQueryValue({ id: 123 }, 'id')).toBe(123)
    expect(getRouteQueryValue({ name: 'test' }, 'name')).toBe('test')
  })

  it('key 不存在返回默认值', () => {
    expect(getRouteQueryValue({ id: 1 }, 'name')).toBe('')
    expect(getRouteQueryValue({ id: 1 }, 'name', 'default')).toBe('default')
  })

  it('query 为空返回默认值', () => {
    expect(getRouteQueryValue(null, 'id')).toBe('')
    expect(getRouteQueryValue(null, 'id', 'fallback')).toBe('fallback')
    expect(getRouteQueryValue(undefined, 'id', 0)).toBe(0)
  })

  it('数组参数取第一个元素', () => {
    expect(getRouteQueryValue({ id: ['a', 'b'] }, 'id')).toBe('a')
    expect(getRouteQueryValue({ id: [] }, 'id')).toBe('')
    expect(getRouteQueryValue({ id: [] }, 'id', 'default')).toBe('default')
  })

  it('值为 null/undefined 返回默认值', () => {
    expect(getRouteQueryValue({ id: null }, 'id', 'default')).toBe('default')
    expect(getRouteQueryValue({ id: undefined }, 'id', 'default')).toBe('default')
  })
})
