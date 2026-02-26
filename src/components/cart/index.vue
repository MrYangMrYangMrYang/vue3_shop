<template>
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      title="购物车"
      left-arrow
      left-text="返回"
      @click-left="back" 
    />
  </van-sticky>

  <!-- 购物车列表 -->
  <van-checkbox-group v-model="checked" @change="CheckList">
    <div class="cart" v-for="cart in cartlist">
      <!-- 复选框 -->
      <van-checkbox :name="cart.id"> </van-checkbox>

      <!-- 滑动单元格 -->
      <van-swipe-cell>
        <!-- 商品卡片 -->
        <van-card
          class="goods-card"
          :title="cart.product.name"
          :price="cart.total"
          :thumb="cart.product.thumbs_text"
        >
          <template #desc>
            <div style="color: #969799">库存：{{ cart.product.stock }}</div>
            <div>单价：{{ cart.price }}</div>
          </template>
          <template #num>
            <van-stepper v-model="cart.nums" :name="cart.id" disable-input @change="CartStep" />
          </template>
        </van-card>

        <!-- 删除按钮 -->
        <template #right>
          <van-button
            square
            text="删除"
            type="danger"
            class="delete-button"
            @click="CartDel(cart.id)"
          />
        </template>
      </van-swipe-cell>
    </div>
  </van-checkbox-group>

  <!-- 提交订单栏 -->
  <van-submit-bar :price="price" button-text="提交订单" @submit="submit">
    <van-checkbox v-model="toggle" @click="ToggleCheck">全选</van-checkbox>
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
  var busid = login.hasOwnProperty('id') ? login.id : 0;
  let cartlist = ref([])
  let checked = ref([])
  let toggle = ref(false)

  const back = () => 
  {
    router.go(-1)
  }

  //生命周期
  onBeforeMount(async () => {
    CartData()
  })

  //获取当前购物车列表
  const CartData = async () => 
  {
    var result = await POST({
      url: '/cart/index',
      params: {busid: busid}
    })

    cartlist.value = result.data
  }

  //切换全选
  const ToggleCheck = () =>
  {
    if(toggle.value)
    {
      for(var item of cartlist.value)
      {
        checked.value.push(item.id)
      }
    }else
    {
      checked.value = []
    }
  }

  //单个切换
  const CheckList = (value) =>
  {
    // console.log(checked,value);
    var list = []
    cartlist.value.map((item) => {
      list.push(item.id)
    })

    //通过比较看选中的值是否与列表的值相等
    var result = checked.value.length === list.length && checked.value.sort().toString() === list.sort().toString();
    
    if(result)
    {
      toggle.value = true
    }else
    {
      toggle.value = false
    }
  }

  //计算价格 计算属性
  let price = computed(() => {
    var sum = 0

    cartlist.value.map((item) => {
      //判断购物车的id  是否在选中的数组中，如果在的话，被选中
      if(checked.value.includes(item.id))
      {
        sum += parseFloat(item.total)
      }
    })

    return sum*100
  })

  //步进器改变
  const CartStep = async (value, detail) => 
  {
    //组装数据
    var data = {
      busid: busid,
      cartid: detail.name,
      nums: value
    }

    //发请求
    var result = await POST({
      url: '/cart/edit',
      params: data
    })

    if(result.code == 0)
    {
        showFailToast(result.msg)
        return false
    }

    cartlist.value = result.data
  }

  // 删除购物车
  const CartDel = async(cartid) => 
  {
    showConfirmDialog({
      title: '删除提醒',
      message: '是否确认删除该宝贝',
    })
    .then(async () => {
      // 组装数据
      var data = {
        cartid: cartid,
        busid: busid
      }

      //发请求
      var result = await POST({
        url: '/cart/del',
        params: data
      })

      if(result.code == 0)
      {
          showFailToast(result.msg)
          return false
      }

      //覆盖最新的购物车结果
      cartlist.value = result.data
      
    })
    .catch(() => {
      // on cancel
    });
  }

  //提交订单
  const submit = () =>
  {
    if(checked.value.length <= 0)
    {
      showFailToast('请选择购物车商品')
      return false
    }

    router.push({
      path: '/cart/confirm',
      query: {
        cartids: checked.value
      }
    })
  }
</script>

<style scoped>
  .cart {
    display: flex;
    width: 100%;
    background: var(--van-card-background);
  }

  .cart .van-checkbox {
    width: 2em;
    display: flex;
    justify-content: right;
    text-align: center;
  }

  .van-card{
    padding-left: 12px;
  }

  .van-swipe-cell {
    width: 100%;
  }
  .delete-button {
    height: 100% !important;
  }
</style>