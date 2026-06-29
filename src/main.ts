import { createApp } from 'vue'
import App from './App.vue'
import router from './routers/index'
import './assets/styles/common.css'
import { Lazyload, showFailToast } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/image-preview/style'
import 'vant/es/loading/style'
import 'vant/es/notify/style'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Lazyload, { lazyComponent: true })

// 全局错误处理：捕获组件内未处理异常（可扩展接入 Sentry 等监控平台）
app.config.errorHandler = (err, _instance, info) => {
  console.error('[全局错误]', err, info)
}

// 路由错误处理：懒加载 chunk 失败时提示刷新（部署更新后旧 chunk 失效的常见场景）
router.onError(error => {
  if (/Loading chunk|Failed to fetch dynamically imported module/.test(error.message)) {
    showFailToast('页面加载失败，请刷新重试')
  }
})

// Promise 未捕获 rejection 兜底：业务层 try/catch 漏网的异步错误在此捕获
// 接入 Sentry 后在此处一并上报，目前仅控制台记录
window.addEventListener('unhandledrejection', event => {
  console.error('[未捕获 Promise]', event.reason)
})

app.mount('#app')
