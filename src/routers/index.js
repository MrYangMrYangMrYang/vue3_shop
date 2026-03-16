//引入路由对象
import { createRouter, createWebHistory } from 'vue-router'
import { useCookies } from "vue3-cookies";
import { showFailToast } from 'vant'
import { POST } from '@/services/request'

//引入组件
import home from '@/components/home.vue'
import BusinessIndex from '@/components/business/index.vue'
import CartIndex from '@/components/cart/index.vue'

// 不常用的组件异步加载
const login = () => import('@/components/login.vue')
const register = () => import('@/components/register.vue')
const BusinessProfile = () => import('@/components/business/profile.vue')
const BusinessEmail = () => import('@/components/business/email.vue')
const ProductList = () => import('@/components/product/list.vue')
const ProductInfo = () => import('@/components/product/info.vue')
const AddressIndex = () => import('@/components/business/address/index.vue')
const AddressAdd = () => import('@/components/business/address/add.vue')
const AddressEdit = () => import('@/components/business/address/edit.vue')
const CartConfirm = () => import('@/components/cart/confirm.vue')
const OrderIndex = () => import('@/components/order/index.vue')
const OrderExpress = () => import('@/components/order/express.vue')
const OrderInfo = () => import('@/components/order/info.vue')
const OrderEveluate = () => import('@/components/order/eveluate.vue')

//创建路由
const router = createRouter({
    //路由模式
    history: createWebHistory(), 
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
            //加上meta 就代表需要登录的，如果没有meta就说不用登录
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/business/profile',
            name: 'BusinessProfile', 
            component: BusinessProfile,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/business/email',
            name: 'BusinessEmail', 
            component: BusinessEmail,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/product/list', 
            name: 'ProductList',
            component: ProductList, 
        },
        {
            path: '/product/info', 
            name: 'ProductInfo',
            component: ProductInfo, 
        },
        {
            path: '/business/address/index',
            name: 'AddressIndex', 
            component: AddressIndex,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/business/address/add',
            name: 'AddressAdd', 
            component: AddressAdd,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/business/address/edit',
            name: 'AddressEdit', 
            component: AddressEdit,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/cart/index',
            name: 'CartIndex', 
            component: CartIndex,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/cart/confirm',
            name: 'CartConfirm', 
            component: CartConfirm,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/order/index',
            name: 'OrderIndex', 
            component: OrderIndex,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/order/express',
            name: 'OrderExpress', 
            component: OrderExpress,
            meta:{ 
                IsLogin: true 
            }
        },
        {
            path: '/order/info', 
            name: 'OrderInfo', 
            component: OrderInfo, 
            meta: {                
                IsLogin: true 
            }
        },
        {
            path: '/order/eveluate', 
            name: 'OrderEveluate', 
            component: OrderEveluate, 
            meta: {
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

//初始化
const {cookies} = useCookies()

// 路由守卫
// 在进入路由前，判断一下该路由是否需要登录
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
    var business = cookies.get('business') ? cookies.get('business') : {};

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
            cookies.remove('business');

            //提醒+跳转
            showFailToast({
                message: result.msg,
                duration: 1000,
            })
            
            next(result.url)
        }else
        {
            //覆盖一下cookies,刷新数据
            cookies.set('business', result.data)
            next()
        }
    }
})

export default router
