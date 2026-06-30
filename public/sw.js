/**
 * Service Worker — 离线缓存策略
 * Network First：优先网络，网络失败时使用缓存兜底
 */

const CACHE_NAME = 'vue-shop-v1'

// 需要预缓存的静态资源（构建产物路径由构建工具注入）
const PRECACHE_URLS = ['/']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // 仅处理 GET 导航请求和静态资源
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request)
        .then(response => {
          // 缓存成功的 GET 响应
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          }
          return response
        })
        .catch(() => cached || new Response('离线状态，请联网后重试', { status: 503 }))

      return cached || fetched
    })
  )
})
