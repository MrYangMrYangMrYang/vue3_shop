import { createApp } from 'vue'
import App from './App.vue'

// 引入路由
import router from './routers/index'
// 引入全局样式
import './assets/styles/common.css'
//引入VantUI组件
import 'vant/lib/index.css'
import Vant from 'vant'
// 引入cookie
import VueCookies from 'vue3-cookies'

// vue应用程序
var app = createApp(App)
    .use(VueCookies)
    .use(router) //挂载路由
    .use(Vant) //挂载UI组件
    .mount('#app')
