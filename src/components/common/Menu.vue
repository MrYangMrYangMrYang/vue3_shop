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
    <van-tabbar-item to="/cart/index" icon="cart-o">购物车</van-tabbar-item>
    <van-tabbar-item to="/business/index" icon="manager-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

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