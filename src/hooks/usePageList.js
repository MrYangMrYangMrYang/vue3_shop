import { ref, computed } from 'vue'
import { getCache, setCache } from '@/utils/cache'

/**
 * 分页列表 Hook
 * @param {Object} options - 配置项
 * @param {Function} options.fetchFn - 数据请求函数 (params) => result
 * @param {Function} [options.processFn] - 数据处理函数 (item) => processedItem
 * @param {Function} [options.onPageLoaded] - 页面加载完成回调 (data) => void
 * @param {string} [options.cacheKey] - 缓存键名，不传则不缓存
 * @param {number} [options.cacheTtl=600000] - 缓存过期时间（毫秒），默认10分钟
 * @param {string} [options.emptyText='没有更多了'] - 列表为空时的提示文字
 * @description 封装分页列表通用逻辑：加载、刷新、缓存、空状态
 */
export function usePageList(options = {}) {
  const {
    fetchFn,
    processFn,
    onPageLoaded,
    cacheKey,
    cacheTtl = 10 * 60 * 1000,
    emptyText = '没有更多了'
  } = options

  const list = ref([])
  const page = ref(1)
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)
  const isLoading = ref(false)

  const finishedText = computed(() => (list.value.length === 0 ? '' : emptyText))

  /** 恢复列表缓存状态 */
  const restoreState = (stateMapper) => {
    if (!cacheKey) return false
    const cached = getCache(cacheKey)
    if (!cached || typeof cached !== 'object') return false

    if (stateMapper) {
      stateMapper(cached)
    } else {
      page.value = Number(cached.page) || 1
      finished.value = Boolean(cached.finished)
      list.value = Array.isArray(cached.list) ? cached.list : []
    }
    return list.value.length > 0
  }

  /** 保存列表缓存状态 */
  const saveState = (extraData = {}) => {
    if (!cacheKey) return
    setCache(cacheKey, {
      page: page.value,
      finished: finished.value,
      list: list.value,
      scrollTop: window.scrollY || 0,
      ...extraData
    }, cacheTtl)
  }

  /** 重置列表状态 */
  const resetList = () => {
    page.value = 1
    finished.value = false
    list.value = []
  }

  /** 加载数据 */
  const loadData = async (params = {}) => {
    if (isLoading.value && page.value > 1) return

    isLoading.value = true
    try {
      const result = await fetchFn({ page: page.value, ...params })

      if (onPageLoaded) {
        onPageLoaded(result)
      }

      const data = result.data
      const items = Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : [])
      const processedItems = processFn ? items.map(processFn) : items

      if (items.length <= 0) {
        finished.value = true
      } else {
        if (page.value === 1) {
          list.value = processedItems
        } else {
          list.value = list.value.concat(processedItems)
        }
        page.value++
        saveState()
      }
    } catch (error) {
      finished.value = true
    } finally {
      loading.value = false
      isLoading.value = false
    }
  }

  /** 下拉刷新 */
  const refresh = async (params = {}) => {
    if (isLoading.value) return
    isLoading.value = true
    resetList()
    await loadData(params)
    refreshing.value = false
    isLoading.value = false
  }

  /** 上拉加载更多 */
  const loadMore = async (params = {}) => {
    if (finished.value || isLoading.value) return
    if (refreshing.value) refreshing.value = false
    await loadData(params)
  }

  return {
    list,
    page,
    loading,
    finished,
    refreshing,
    isLoading,
    finishedText,
    resetList,
    loadData,
    refresh,
    loadMore,
    restoreState,
    saveState
  }
}
