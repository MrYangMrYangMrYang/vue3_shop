/**
 * @module utils/cache
 * @description sessionStorage 轻量缓存，支持 TTL 过期
 */

interface CachePayload<T = unknown> {
  value: T
  expireAt: number
}

/**
 * 获取缓存（自动处理过期）
 * @param key 缓存键
 */
const getCache = <T = unknown>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachePayload<T>
    if (!parsed || typeof parsed !== 'object') return null
    const { value, expireAt } = parsed
    if (!expireAt || Date.now() > expireAt) {
      sessionStorage.removeItem(key)
      return null
    }
    return value
  } catch (error) {
    return null
  }
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param value 缓存值
 * @param ttlMs 过期时间（毫秒），默认 5 分钟
 */
const setCache = <T = unknown>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void => {
  try {
    const payload: CachePayload<T> = { value, expireAt: Date.now() + ttlMs }
    sessionStorage.setItem(key, JSON.stringify(payload))
  } catch (error) {}
}

/** 删除缓存 */
const removeCache = (key: string): void => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {}
}

export { getCache, setCache, removeCache, type CachePayload }
