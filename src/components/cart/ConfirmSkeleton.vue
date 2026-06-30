<!--
  @fileoverview 结算页首屏骨架屏
  @module components/cart/ConfirmSkeleton
  @description 结算页数据加载期间的占位骨架，模拟地址卡片、商品清单、备注区三大区块
  @example
  <ConfirmSkeleton v-if="loading" />
-->
<template>
  <div class="confirm-content">
    <div class="card-item sk-address">
      <div class="sk-row">
        <van-skeleton-title title-width="80px" />
      </div>
      <!-- Vant 4 row-width 文档支持数组但 prop 类型仅限 string|number（已知 bug），详见 src/types/vant.d.ts -->
      <van-skeleton-paragraph :row-width="['40%', '80%'] as unknown as string" />
    </div>
    <div class="card-item sk-goods">
      <div class="sk-section-title"><van-skeleton-title title-width="60px" /></div>
      <div v-for="i in 2" :key="i" class="sk-goods-item">
        <van-skeleton-image image-size="80px" />
        <div class="sk-goods-info">
          <van-skeleton-title title-width="80%" />
          <van-skeleton-paragraph :row-width="['50%', '30%'] as unknown as string" />
        </div>
      </div>
    </div>
    <div class="card-item sk-remark">
      <div class="sk-section-title"><van-skeleton-title title-width="60px" /></div>
      <van-skeleton-paragraph :row-width="['100%', '60%'] as unknown as string" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConfirmSkeleton' })
</script>

<style scoped>
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

.sk-address {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-row {
  margin-bottom: 4px;
}

.sk-goods {
  padding-bottom: 12px;
}

.sk-section-title {
  padding: 16px 16px 12px;
}

.sk-goods-item {
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  align-items: center;
}

.sk-goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-remark {
  padding-bottom: 16px;
}
</style>
