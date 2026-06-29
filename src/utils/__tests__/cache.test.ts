import { describe, it, expect, beforeEach } from 'vitest'
import { getCache, setCache, removeCache } from '../cache'

describe('cache (sessionStorage)', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('setCache / getCache', () => {
    it('存取基本值', () => {
      setCache('key', 'value')
      expect(getCache('key')).toBe('value')
    })

    it('存取对象', () => {
      const data = { id: 1, name: 'test' }
      setCache('key', data)
      expect(getCache('key')).toEqual(data)
    })

    it('存取数组', () => {
      setCache('key', [1, 2, 3])
      expect(getCache('key')).toEqual([1, 2, 3])
    })

    it('未设置的 key 返回 null', () => {
      expect(getCache('notExist')).toBeNull()
    })
  })

  describe('TTL 过期', () => {
    it('TTL 内可读取', () => {
      setCache('key', 'value', 1000)
      expect(getCache('key')).toBe('value')
    })

    it('TTL 过期后返回 null 并清除', () => {
      setCache('key', 'value', 50)
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(getCache('key')).toBeNull()
          expect(sessionStorage.getItem('key')).toBeNull()
          resolve()
        }, 80)
      })
    })

    it('默认 TTL 为 5 分钟', () => {
      setCache('key', 'value')
      const raw = JSON.parse(sessionStorage.getItem('key') || 'null')
      const ttl = raw.expireAt - Date.now()
      expect(ttl).toBeGreaterThan(4 * 60 * 1000)
      expect(ttl).toBeLessThanOrEqual(5 * 60 * 1000)
    })
  })

  describe('removeCache', () => {
    it('删除已存在的 key', () => {
      setCache('key', 'value')
      removeCache('key')
      expect(getCache('key')).toBeNull()
    })

    it('删除不存在的 key 不报错', () => {
      expect(() => removeCache('notExist')).not.toThrow()
    })
  })

  describe('异常处理', () => {
    it('getCache 读取损坏数据返回 null', () => {
      sessionStorage.setItem('bad', 'not-json')
      expect(getCache('bad')).toBeNull()
    })

    it('getCache 读取非对象 JSON 返回 null', () => {
      sessionStorage.setItem('str', JSON.stringify('hello'))
      expect(getCache('str')).toBeNull()
    })

    it('setCache 不可序列化的值不报错', () => {
      expect(() => setCache('key', undefined)).not.toThrow()
    })
  })
})
