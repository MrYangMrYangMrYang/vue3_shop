//引入路由对象
import { createRouter, createWebHashHistory } from 'vue-router'

//引入组件
import home from '@/components/home.vue'
import BusinessIndex from '@/components/business/index.vue'
import register from '@/components/register.vue'
import login from '@/components/login.vue'
import BusinessProfile from '@/components/business/profile.vue'
import BusinessEmail from '@/components/business/email.vue'
import ProductList from '@/components/product/list.vue'
import ProductInfo from '@/components/product/info.vue'
import AddressIndex from '@/components/business/address/index.vue'
import AddressAdd from '@/components/business/address/add.vue'
import AddressEdit from '@/components/business/address/edit.vue'
import CartIndex from '@/components/cart/index.vue'
import CartConfirm from '@/components/cart/confirm.vue'
import OrderIndex from '@/components/order/index.vue'
import OrderExpress from '@/components/order/express.vue'
import OrderInfo from '@/components/order/info.vue'
import OrderEveluate from '@/components/order/eveluate.vue'


//创建路由
export default createRouter({
    history: createWebHashHistory(), //hash路由模式s
    //路由列表
    routes: [
        {
            path: '/', //路由地址
            name: 'home',//路由名字
            component: home, //路由组件
        },
        {
            path: '/business/index',
            name: 'BusinessIndex', 
            component: BusinessIndex,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/business/profile',
            name: 'BusinessProfile', 
            component: BusinessProfile,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/business/email',
            name: 'BusinessEmail', 
            component: BusinessEmail,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/product/list', //路由地址
            name: 'ProductList',//路由名字
            component: ProductList, //路由组件
        },
        {
            path: '/product/info', //路由地址
            name: 'ProductInfo',//路由名字
            component: ProductInfo, //路由组件
        },
        {
            path: '/business/address/index',
            name: 'AddressIndex', 
            component: AddressIndex,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/business/address/add',
            name: 'AddressAdd', 
            component: AddressAdd,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/business/address/edit',
            name: 'AddressEdit', 
            component: AddressEdit,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/cart/index',
            name: 'CartIndex', 
            component: CartIndex,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/cart/confirm',
            name: 'CartConfirm', 
            component: CartConfirm,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/order/index',
            name: 'OrderIndex', 
            component: OrderIndex,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/order/express',
            name: 'OrderExpress', 
            component: OrderExpress,
            meta:{ //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/order/info', // 路由地址
            name: 'OrderInfo', // 路由名字
            component: OrderInfo, // 路由组件
            meta: {
                //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/order/eveluate', // 路由地址
            name: 'OrderEveluate', // 路由名字
            component: OrderEveluate, // 路由组件
            meta: {
                //加上meta 就代表需要登录的，如果没有meta就说不用登录
                IsLogin: true 
            }
        },
        {
            path: '/register',
            name: 'register',
            component: register
        },
        {
            path: '/login',
            name: 'login',
            component: login
        }
    ]
})
