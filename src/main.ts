import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import './assets/styles/common.css'
import { Lazyload, showFailToast } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/image-preview/style'
import 'vant/es/loading/style'
import 'vant/es/notify/style'
import { createPinia } from 'pinia'
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Lazyload, { lazyComponent: true })

// 全局错误处理：捕获组件内未处理异常（可扩展接入 Sentry 等监控平台）
app.config.errorHandler = (err, _instance, info) => {
  console.error('[全局错误]', err, info)
}

// 过滤 Vant 4 已知类型 bug 警告：van-skeleton-paragraph 的 row-width 文档支持数组但 prop 类型仅限 string|number
// 详见 https://github.com/youzan/vant/issues/12041
app.config.warnHandler = (msg, _instance, trace) => {
  if (msg.includes('Invalid prop: type check failed for prop "rowWidth"')) return
  console.warn(`[Vue warn]${trace ? `\n${trace}` : ''}`, msg)
}

// 路由错误处理：懒加载 chunk 失败时提示刷新（部署更新后旧 chunk 失效的常见场景）
router.onError(error => {
  if (/Loading chunk|Failed to fetch dynamically imported module/.test(error.message)) {
    showFailToast('页面加载失败，请刷新重试')
  }
})

// Promise 未捕获 rejection 兜底：业务层 try/catch 漏网的异步错误在此捕获
window.addEventListener('unhandledrejection', event => {
  console.error('[未捕获 Promise]', event.reason)
})

/* ========== Core Web Vitals 性能监控 ========== */
/**
 * Web Vitals 回调：开发环境输出到控制台，生产环境可接入 Sentry / GA / 自定义埋点
 * @see https://web.dev/vitals/
 */
const reportWebVitals = (metric: Metric): void => {
  // 生产环境：接入 Sentry 或 Analytics
  // Sentry.captureMessage(`WebVitals:${metric.name}`, { level: 'info', extra: metric });
  // gtag('event', 'web_vitals', { ...metric });

  // 开发环境：控制台输出
  if (import.meta.env.DEV) {
    const rating = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴'
    console.debug(`[WebVitals] ${rating} ${metric.name}: ${metric.value.toFixed(2)}`)
  }
}

onCLS(reportWebVitals)
onINP(reportWebVitals)
onLCP(reportWebVitals)
onFCP(reportWebVitals)
onTTFB(reportWebVitals)

app.mount('#app')
