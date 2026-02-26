<template>
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      :title="product.name"
      left-arrow
      left-text="返回"
      @click-left="back"
    >
      <template #right>
        <van-icon name="share-o" size="18" @click="ShareShow = true" />
      </template>
    </van-nav-bar>
  </van-sticky>

  <!-- 分享面板 -->
  <van-share-sheet
    v-model:show="ShareShow"
    title="立即分享"
    :options="options"
    @select="share"
  />

  <!-- 商品图片 -->
  <div>
    <img :src="product.thumbs_text" style="width:100%;height:300px" />
  </div>

  <!-- 商品信息 -->
  <div class="detailbox">
    <h4>{{product.name}}</h4>
    <div class="price"><em>￥</em>{{product.price}}
      <b>库存：{{product.stock}} {{product.unit ? product.unit.name : ''}}</b>
    </div>
  </div>

  <div class="allkbox"></div>

  <!-- 商品参数 -->
  <div class="detailbox_2">
    <p class="tit">产品参数：</p>
    <div v-html="product.content"></div>
  </div>

  <!-- 动作栏 -->
  <van-action-bar>
    <van-action-bar-icon icon="chat-o" text="客服" dot @click="contact" />
    <router-link to="/cart/index">
      <van-action-bar-icon icon="cart-o" text="购物车" :badge="count" v-if="count > 0" />
      <van-action-bar-icon icon="cart-o" text="购物车" v-else />
    </router-link>
    <van-action-bar-button type="warning" text="加入购物车" @click="AddCart" />
    <van-action-bar-button type="danger" text="立即购买" @click="Buy"/>
  </van-action-bar>


</template>

<script setup>
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount} from 'vue'
  import {POST, UPLOAD} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import { useCookies } from "vue3-cookies";

  const router = useRouter()
  const route = useRoute()
  const {cookies} = useCookies()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  var busid = login.hasOwnProperty('id') ? login.id : 0;

  let proid = route.query.hasOwnProperty('proid') ? route.query.proid : 0;
  let product = ref({})
  let count = ref(0)
  let mobile = ref('')
  let ShareShow = ref(false)
  let cartid=ref('')
  const options = [
    [
      { name: '微信', icon: 'wechat' },
      { name: '朋友圈', icon: 'wechat-moments' },
      { name: '微博', icon: 'weibo' },
      { name: 'QQ', icon: 'qq' },
    ],
    [
      { name: '复制链接', icon: 'link' },
      { name: '分享海报', icon: 'poster' },
      { name: '二维码', icon: 'qrcode' },
      { name: '小程序码', icon: 'weapp-qrcode' },
    ],
  ];

  // 生命周期
  onBeforeMount(async () => 
  {
    ProductInfo()
  })

  const back = () => 
  {
    router.go(-1)
  }

  //商品信息
  const ProductInfo = async () => 
  {
    var result = await POST({
      url: '/index/info',
      params: {
        proid: proid,
        busid: busid
      }
    })

    if(result.code == 0)
    {
      showFailToast({
        message: result.msg,
        onClose: () => 
        {
          router.go(-1)
        }
      })
      return false
    }

    // console.log(result);

    product.value = result.data.product
    count.value = result.data.count
    mobile.value = result.data.contact

    // console.log(count.value)
  }

  //拨打电话
  const contact = async () =>
  {
    // console.log(mobile.value);
    showConfirmDialog({
      title: '拨打提醒',
      message: '是否确认拨打客服电话',
    })
    .then(() => {
      location.href = `tel:${mobile.value}`
    })
    .catch(()=>{})
  }

  // 分享
  const share = async (options) => 
  {
    ShareShow.value = false
    console.log(options)
  }

  //加入购物车
  const AddCart = async () =>
  {
    showConfirmDialog({
      title: '购物车提醒',
      message: '是否将该宝贝加入到购物车',
    })
    .then(async () => {
      //判断是否有没有登录
      if(!busid)
      {
        showFailToast('请先登录')
        return false
      }

      //组装数据
      var data = {
        busid: busid,
        proid: proid
      }

      //发请求
      var result = await POST({
        url: '/cart/add',
        params: data
      })

      if(result.code == 0)
      {
        showFailToast(result.msg)
        return false
      }

      showSuccessToast(result.msg)

      //更新购物车数据
      ProductInfo()
    })
    .catch(()=>{})
  }

  //立即购买
  const Buy = () =>{
    showConfirmDialog({
      title: '购买提醒',
      message: '是否立即购买该宝贝',
    })

    .then(async ()=>{

      //判断是否有没有登录
      if(!busid)
      {
        showFailToast('请先登录')
        return false
      }

      var result=await POST({
        url:'/cart/buy',
        params:{
          busid:busid,
          proid:proid,
        }
      })

      if (result.code == 0) {
        showFailToast({
          message: result.msg,
          onClose: () => {
            router.go(-1);
          },
        });
        return false;
      }

      cartid.value=result.data

      router.push({
        path:'/cart/confirm',
        query:{
          cartids:cartid.value,
          action:'buy'
        }
      })
    })
    .catch(()=>{})
  }
</script>