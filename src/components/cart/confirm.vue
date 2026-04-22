<template>
  <div class="confirm-page">
    <van-sticky>
      <van-nav-bar
        :title="action ? '购买结算' : '订单结算'"
        left-arrow
        @click-left="action ? backbuy() : back()"
        class="custom-nav"
      />
    </van-sticky>

    <div class="confirm-content">
      <!-- 地址选择区域 -->
      <div class="address-section card-item">
        <div class="address-header">
          <van-icon name="location" class="location-icon" />
          <span class="title">收货地址</span>
        </div>
        
        <div v-if="address && address.length > 0" class="address-info" @click="AddressToggle">
          <div class="user-info">
            <span class="name">{{ address[0].name }}</span>
            <span class="tel">{{ address[0].tel }}</span>
          </div>
          <div class="address-detail">
            {{ address[0].address }}
          </div>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
        
        <van-contact-card 
          v-else 
          type="add" 
          add-text="请添加收货地址" 
          @click="AddressAdd" 
          class="add-address-card"
        />
        
        <div class="address-border"></div>
      </div>
      
      <!-- 商品列表区域 -->
      <div class="goods-section card-item">
        <div class="section-title">商品清单</div>
        <div class="cart-item" v-for="cart in cartlist" :key="cart.id">
          <van-card
            :num="cart.nums"
            :price="cart.total"
            :title="cart.product.name"
            :thumb="cart.product.thumbs_text"
          >
            <template #desc>
              <div class="goods-desc">
                <span>单价: ¥{{ cart.price }}</span>
                <span class="stock">库存: {{ cart.product.stock }}</span>
              </div>
            </template>
          </van-card>
        </div>
      </div>

      <!-- 订单备注 -->
      <div class="remark-section card-item">
        <div class="section-title">订单备注</div>
        <van-field
          v-model="remark"
          rows="2"
          autosize
          type="textarea"
          maxlength="100"
          placeholder="有什么想对卖家说的吗？"
          show-word-limit
          class="remark-input"
        />
      </div>
    </div>

    <!-- 提交订单栏 -->
    <van-submit-bar 
      :price="price" 
      button-text="提交订单" 
      @submit="submit" 
      safe-area-inset-bottom
      class="custom-submit-bar"
    />
  </div>
</template>

<style scoped>
.confirm-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon),
:deep(.van-nav-bar__text) {
  color: white !important;
}

.confirm-content {
  padding: 12px;
}

.card-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.address-section {
  position: relative;
  padding: 16px;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.location-icon {
  font-size: 18px;
  color: var(--primary-color);
  margin-right: 6px;
}

.address-info {
  position: relative;
  padding-right: 24px;
}

.user-info {
  margin-bottom: 4px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  margin-right: 8px;
}

.tel {
  font-size: 14px;
  color: var(--text-secondary);
}

.address-detail {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
}

.arrow-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-placeholder);
}

.address-border {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-image: repeating-linear-gradient(
    -45deg,
    #ff464e 0,
    #ff464e 20%,
    transparent 20%,
    transparent 25%,
    #58a 25%,
    #58a 45%,
    transparent 45%,
    transparent 50%
  );
  background-size: 80px 3px;
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.goods-section :deep(.van-card) {
  background: white;
  padding: 8px 16px;
}

.goods-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
}

.remark-input {
  padding: 12px 16px;
}

.custom-submit-bar {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

:deep(.van-submit-bar__button--danger) {
  background: var(--primary-gradient);
  border: none;
}

:deep(.van-contact-card::before) {
  display: none;
}

.add-address-card {
  padding: 12px 0;
}
</style>

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