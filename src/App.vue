<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <keep-alive :include="['product-list']">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style>
/* 全局路由切换动画 */
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

/* 适配移动端滚动条 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}

/* 统一卡片点击态 */
.van-cell--clickable:active {
  background-color: #f2f3f5 !important;
}

/* 统一按钮阴影 */
.van-button--primary {
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2) !important;
}
</style>