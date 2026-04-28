<!-- 
  @fileoverview 底部导航菜单组件
  @module components/common/Menu
  @description 公共组件：提供首页、购物车、个人中心三大模块的切换导航（TabBar），
               并实时显示购物车角标数量，是全局布局的基础组件，被多个页面引用
  @requires stores/cart
  @requires stores/user
-->
<template>
  <van-tabbar 
    route 
    active-color="var(--primary-color)" 
    inactive-color="#969799" 
    placeholder 
    border
    class="custom-tabbar"
  >
    <van-tabbar-item to="/" icon="wap-home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/cart/index" icon="cart-o" :badge="cartStore.count > 0 ? cartStore.count : null">购物车</van-tabbar-item>
    <van-tabbar-item to="/business/index" icon="manager-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'

const cartStore = useCartStore()
const userStore = useUserStore()

/** 挂载时同步购物车徽标数量 */
onMounted(() => {
  if (userStore.userInfo && userStore.userInfo.id) cartStore.updateCount(userStore.userInfo.id)
})
</script>

<style scoped>
:deep(.van-tabbar) {
  height: 56px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: none;
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
  margin-bottom: 2px;
  transition: transform var(--transition-fast);
}

:deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  transform: translateY(-2px);
}

:deep(.van-tabbar-item__text) {
  font-size: 11px;
  font-weight: 500;
}
</style>