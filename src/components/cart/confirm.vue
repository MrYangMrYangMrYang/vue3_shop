<template>
  <van-sticky v-if="action">
    <!-- 导航栏 -->
    <van-nav-bar
      title="购买结算"
      left-arrow
      left-text="返回"
      @click-left="backbuy"
    />
  </van-sticky>

  <van-sticky v-else>
    <!-- 导航栏 -->
    <van-nav-bar
      title="订单结算"
      left-arrow
      left-text="返回"
      @click-left="back" 
    />
  </van-sticky>

  <!-- 选择收货地址 -->
  <!-- <van-contact-card type="edit" v-if="address" :name="address.consignee" :tel="address.address"  @click="AddressToggle" /> -->
  <div class="adress">
    <div class="tb"><span class="qrdd-a1-img1"></span></div>
    <van-address-list v-if="address" :list="address" @edit="AddressToggle" style="padding:0px 10px 0px;border-bottom:dashed 3px #666;"/>
    <van-contact-card type="add" add-text="请添加收货地址" @click="AddressAdd" v-else />
  </div>
  
  <!-- 购物车列表 -->
  <div class="cart" v-for="cart in cartlist">
    <!-- 商品卡片 -->
    <van-card
      class="goods-card"
      :title="cart.product.name"
      :price="cart.total"
      :thumb="cart.product.thumbs_text"
      :num="cart.nums"
    >
      <template #desc>
        <div style="color: #969799">库存：{{ cart.product.stock }}</div>
        <div>单价：{{ cart.price }}</div>
      </template>
    </van-card>
  </div>

  <!-- 订单备注 -->
  <van-cell-group inset>
    <van-field
      v-model="remark"
      rows="2"
      autosize
      type="textarea"
      maxlength="100"
      placeholder="请输入订单备注"
      show-word-limit
    />
  </van-cell-group>

  <!-- 提交订单栏 -->
  <van-submit-bar :price="price" button-text="提交订单" @submit="submit" style="z-index: 999;">
  </van-submit-bar>
  
</template>

<script setup>
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount, computed} from 'vue'
  import {POST, UPLOAD} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import { useCookies } from "vue3-cookies";

  const router = useRouter()
  const route = useRoute()
  const {cookies} = useCookies()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  var addrid = cookies.get('address') ? cookies.get('address') : 0;

  var busid = login.hasOwnProperty('id') ? login.id : 0;
  let cartlist = ref([])
  var cartids = route.query.hasOwnProperty('cartids') ? route.query.cartids : [];
  var remark = ref('')
  let action = route.query.hasOwnProperty("action") ? route.query.action : "";
  let address = reactive([])

  // 从立即购买过来的返回按钮
  const backbuy = async () => {
    // console.log(cartids);
    var result = await POST({
      url: "/cart/delbuy",
      params: {
        cartid: cartids,
        busid: busid,
      },
    });

    if (result.code == 0) {
      showFailToast(result.msg);
      router.go(-1);
    }

    router.go(-1);
  }

  const back = () => 
  {
    router.go(-1)
  }

  const AddressAdd = () =>
  {
    router.push('/business/address/add')
  }

  const AddressToggle = () =>
  {
    router.push({
      path: '/business/address/index',
      query: {
        action: 'order'
      }
    })
  }

  //生命周期
  onBeforeMount(async () => {
    await CartData()
    await CartAddress()
  })

  //获取用户的下单地址
  const CartAddress = async () =>
  {
    var result = await POST({
      url: '/address/order',
      params: {
        busid: busid,
        addrid: addrid
      }
    })

    address.push({
      id: result.data.id,
      name: result.data.consignee,
      tel: result.data.mobile,
      address: `${result.data.address_text} ${result.data.address}`,
    })
  }

  //获取当前购物车列表
  const CartData = async () => 
  {
    var result = await POST({
      url: '/cart/index',
      params: {
        busid: busid,
        cartids: cartids.toString(",")
      }
    })

    cartlist.value = result.data
  }

  //计算价格 计算属性
  let price = computed(() => {
    var count = 0

    cartlist.value.map((item) => {
      count += parseFloat(item.total)
    })

    return count*100
  })

  //提交订单
  const submit = () =>
  {
    //组装数据
    var data = {
      busid: busid,
      addrid: address[0].id,
      remark: remark.value,
      cartids: cartids.toString(",")
    }

    showConfirmDialog({
      title: '订单提醒',
      message: '是否确认订单',
    })
    .then(async () => {
      //发请求
      var result = await POST({
        url: '/order/add',
        params: data
      })

      if(result.code == 0)
      {
          showFailToast(result.msg)
          return false
      }
      
      showSuccessToast({
        message: result.msg,
        onClose: () => {
          //跳转
          router.push(result.url)
        }
      })
      
    })
    .catch(() => {
      // on cancel
    });  
  }

</script>

<style>
  .cart {
    display: block;
    width: 100%;
    background: var(--van-card-background);
  }
  .qrdd-a1-img1{
    width: 20px;
    height: 30px;
    float: left;
    background: url(../images/jd-xq-img1.png) no-repeat;
    background-size: 100%;
  }
  .adress{
    position: relative;
  }
  .tb{
    position: absolute;
    left: 21px;
    top: 25px;
    width: 20px;
    height: 30px;
    z-index: 999;
  }
</style>