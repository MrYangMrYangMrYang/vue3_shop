import { useRouter } from 'vue-router'

/**
 * 返回导航 Hook
 * @param {number} [delta=-1] - 返回的页面数，默认-1（上一页）
 * @description 封装 router.go(-1) 返回逻辑，统一页面返回行为
 */
export function useBack(delta = -1) {
  const router = useRouter()
  return () => router.go(delta)
}
