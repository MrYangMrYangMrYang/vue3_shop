import { createApp } from 'vue'
import App from './App.vue'
import router from './routers/index'
import './assets/styles/common.css'
import 'vant/lib/index.css'
import Vant from 'vant'
import { Lazyload } from 'vant'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vant)
app.use(Lazyload, { lazyComponent: true })
app.mount('#app')
