<template>
  <!-- 模板布局页面加载 -->
  <!-- <router-view></router-view> -->

  <!-- 组件缓存：避免了组件反复销毁重建，既保留滚动位置又减少了重复请求 -->
  <router-view v-slot="{ Component }">
    <keep-alive :include="['product-list']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>