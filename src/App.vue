<template>
  <router-view v-slot="{ Component }">
    <!-- 路由切换动画 + 缓存（仅缓存商品列表页） -->
    <transition name="fade-slide" mode="out-in">
      <keep-alive :include="['product-list']">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style>
/* 路由切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* 按钮主题色阴影 */
.van-button--primary {
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2) !important;
}
</style>
