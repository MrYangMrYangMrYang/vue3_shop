import { createApp } from 'vue'
import App from './App.vue'

// 引入路由
import router from './routers/index'

//引入VantUI组件
import 'vant/lib/index.css'
import Vant from 'vant'

// 引入cookie
import VueCookies from 'vue3-cookies'

// vue应用程序
var app = createApp(App)
    .use(router) //挂载路由
    .use(Vant) //挂载UI组件
    .use(VueCookies)
    .mount('#app')

import {showFailToast} from 'vant'
import {POST} from '@/services/request'


//在进入路由前，判断一下该路由是否需要登录
// to 去哪
// from 从哪来
// next 是否要让他通过路由访问
router.beforeEach(async (to, from, next) => {
    //拿到是否需要登录的属性
    var IsLogin = to.meta.IsLogin ? to.meta.IsLogin : false

    //如果为true 就说明需要登录
    if(!IsLogin)
    {
        //不用登录也可以访问，直接通过
        next()
        return false
    }

    //获取cookie
    var business = app.$cookies.get('business') ? app.$cookies.get('business') : {};

    //如何判断对象是否为空
    if(Object.keys(business).length <= 0)
    {
        showFailToast({
            message: '请先登录',
            duration: 500,
        })

        next('/login')
    }else
    {
        //判断一个对象是否具备某个属性,如果对象不为空，就获取属性
        var id = business.hasOwnProperty('id') ? business.id : 0;
        var mobile = business.hasOwnProperty('mobile') ? business.mobile : 0;

        //组装数据
        var data = {id,mobile}

        var result = await POST({
            url: "/business/check",
            params: data
        })

        if(result.code == 0)
        {
            //cookie伪造的
            app.$cookies.remove('business');

            //提醒+跳转
            showFailToast({
                message: result.msg,
                duration: 1000,
            })
            
            next(result.url)
        }else
        {
            //覆盖一下cookies,刷新数据
            app.$cookies.set('business', result.data)
            next()
        }
    }
})