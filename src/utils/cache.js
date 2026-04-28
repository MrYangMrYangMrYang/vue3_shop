/**
 * 获取缓存（自动处理过期）
 * @param {string} key
 * @returns {*}
 */
const getCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
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
 * @param {string} key
 * @param {*} value
 * @param {number} [ttlMs=300000] 过期时间（毫秒），默认5分钟
 */
const setCache = (key, value, ttlMs = 5 * 60 * 1000) => {
  try {
    const payload = { value, expireAt: Date.now() + ttlMs }
    sessionStorage.setItem(key, JSON.stringify(payload))
  } catch (error) {}
}

/** 删除缓存 */
const removeCache = (key) => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {}
}

export { getCache, setCache, removeCache }
