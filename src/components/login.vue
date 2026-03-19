<template>
  <!--图标样式-->
  <link rel="stylesheet" type="text/css" href="/css/font-awesome.min.css" />
  <!--布局框架-->
  <link rel="stylesheet" type="text/css" href="/css/util.css" />
  <!--主要样式-->
  <link rel="stylesheet" type="text/css" href="/css/main.css" />
  
  <div class="limiter">
    <div class="container-login100" style="background-image: url('/images/海.jpg');">
        <div class="wrap-login100 p-b-150">
            <div style=" width:200px; heigth:200px; margin:0 auto 20px;"><img src="/images/tx.png" style="width:100%;heigth:100%;border-radius:50%;"/></div>
            <van-form @submit="login">
                <van-cell-group inset>
                  <!-- 手机号 -->
                  <van-field
                    v-model="business.mobile"
                    name="mobile"
                    label="手机号码"
                    placeholder="请输入手机号码"
                    :rules="rules.mobile"
                  />
  
                  <!-- 密码 -->
                  <van-field
                    v-model="business.password"
                    type="password"
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    :rules="rules.password"
                  />
                </van-cell-group>
  
                <div style="width:10rem;margin:20px auto 0px;">
                  <van-button round block type="success" native-type="submit" size="small">登录</van-button>
                </div>
              </van-form>
              <router-link to="/register">
                <div>
                    <button style="display:block; margin: 15px auto 0; color:white">没有账号，请先注册</button>
                </div>
              </router-link>             
        </div>
    </div>
  </div>
</template>

<script setup>
  import {reactive} from 'vue'
  import {POST} from '@/services/request'
  import {showSuccessToast, showFailToast} from 'vant'
  import {useRouter} from 'vue-router'
  import { useCookies } from "vue3-cookies";

  const {cookies} = useCookies();

  // 初始化路由的跳转函数
  const router = useRouter()

  //获取cookie
  var buscheck = cookies.get('business') ? cookies.get('business') : {};

  //说明对象中没有属性存在
  if(Object.keys(buscheck).length > 0)
  {
    router.push('business/index')
  }

  //初始化数据
  let business = reactive({
    mobile:'',
    password:''
  })

  //验证规则
  let rules = reactive({
    mobile: [
      {
        required: true,
        message: '请输入手机号码',
      },
      {
        pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
        message: '手机号码格式有误'
      }
    ],
    password: [
      {
        required: true,
        message: '请输入密码',
      },
      {
        pattern: /.{6,}/,
        message: '密码只要6位以上'
      }
    ]
  })

//   提交表单
  let login = async (values) => {
    //组装数据
    var data = {
        mobile:values.mobile,
        password: values.password
    }

    //请求接口
    var result = await POST({
        url: 'business/login',
        params: data
    })

    //返回请求结果
    console.log(result)

    if(result.code == 0)
    {
        showFailToast(result.msg)
        return false
    }

    showSuccessToast({
        message: result.msg,
        onClose: () => {
            //存cookie，跳转
            cookies.set('business', result.data)

            //跳转
            router.push(result.url)
        }
    })
  }

</script>