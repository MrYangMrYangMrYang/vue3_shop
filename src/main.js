import { createApp } from 'vue'
import App from './App.vue'
import router from './routers/index'
import './assets/styles/common.css'
import { Lazyload } from 'vant'
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
app.mount('#app')
