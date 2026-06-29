<!--
  @fileoverview 订单卡片子组件
  @module components/order/OrderCard
  @description 展示单个订单信息（商品图/名称/金额/状态）及状态对应的操作按钮，
               通过 emits 通知父组件执行具体业务操作，自身不持有业务状态
  @requires constants/order
  @requires utils/currency
  @requires utils/countdown
-->
<template>
  <div class="order-card" :class="{ 'order-disappearing': isDisappearing }">
    <div v-if="isPendingPayment(order.status) && !isPaymentExpired(order.createtime)" class="countdown-bar">
      <van-icon name="clock-o" />
      <span class="countdown-label">剩余付款时间</span>
      <span class="countdown-time">{{ countdownTime || '30:00' }}</span>
    </div>

    <div class="order-header">
      <span class="order-no">订单号: {{ order.code }}</span>
      <span class="order-status" :class="order.status_class">
        {{ order.status_text }}
      </span>
    </div>

    <div class="order-content" @click="emit('detail', order.id)">
      <div class="product-img">
        <img v-lazy="order.thumbs_text" alt="" />
      </div>
      <div class="product-info">
        <div class="product-name">{{ order.name_text }}</div>
        <div class="order-time">{{ order.createtime_text }}</div>
        <div class="order-price">
          <span class="label">{{ isPendingPayment(order.status) ? '需付:' : '实付:' }}</span>
          <span class="currency">¥</span>
          <span class="amount">{{ formatAmount(order.amount) }}</span>
        </div>
      </div>
    </div>

    <div class="order-footer">
      <van-button
        v-if="!isPendingPayment(order.status)"
        size="small"
        round
        class="btn-detail"
        @click="emit('detail', order.id)"
      >
        订单详情
      </van-button>

      <van-button
        v-if="isPendingPayment(order.status)"
        size="small"
        round
        class="btn-action primary"
        :loading="isLoading"
        :disabled="isLoading || isPaymentExpired(order.createtime)"
        @click="emit('pay', order.id)"
      >
        去付款
      </van-button>

      <van-button
        v-if="isPendingPayment(order.status)"
        size="small"
        round
        class="btn-action"
        @click="emit('cancel', order.id)"
      >
        取消订单
      </van-button>

      <van-button
        v-if="order.status === ORDER_STATUS.PENDING_SHIP"
        size="small"
        round
        class="btn-action primary"
        @click="emit('urge')"
      >
        催发货
      </van-button>

      <van-button
        v-if="order.status === ORDER_STATUS.PENDING_RECEIVE && order.exfasscode"
        size="small"
        round
        class="btn-action"
        @click="emit('express', order.id)"
      >
        查看物流
      </van-button>

      <van-button
        v-if="order.status === ORDER_STATUS.PENDING_RECEIVE"
        size="small"
        round
        class="btn-action primary"
        :loading="isLoading"
        :disabled="isLoading"
        @click="emit('confirm', order.id)"
      >
        确认收货
      </van-button>

      <van-button
        v-if="order.status === ORDER_STATUS.PENDING_REVIEW"
        size="small"
        round
        class="btn-action warning"
        @click="emit('evaluate', order.id)"
      >
        评价晒单
      </van-button>

      <van-button
        v-if="order.status === ORDER_STATUS.COMPLETED"
        size="small"
        round
        class="btn-action danger"
        :loading="isLoading"
        :disabled="isLoading"
        @click="emit('afterSale', order.id)"
      >
        申请售后
      </van-button>

      <van-button v-if="order.status === ORDER_STATUS.AFTER_SALE" size="small" round disabled class="btn-action">
        售后审核中
      </van-button>

      <van-button v-if="isCancelled(order.status)" size="small" round disabled class="btn-action">已取消</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ORDER_STATUS, isPendingPayment, isCancelled } from '@/constants/order'
import { formatCurrency } from '@/utils/currency'
import { isPaymentExpired } from '@/utils/countdown'

/** 订单数据结构（后端返回字段，模板渲染所需的子集） */
interface OrderItem {
  id: string | number
  code?: string
  status?: string | number
  status_text?: string
  status_class?: string
  thumbs_text?: string
  name_text?: string
  createtime_text?: string
  createtime?: string | number
  amount?: number
  exfasscode?: string | number
}

defineProps<{
  order: OrderItem
  countdownTime?: string
  isLoading?: boolean
  isDisappearing?: boolean
}>()

const emit = defineEmits<{
  (e: 'detail', id: OrderItem['id']): void
  (e: 'pay', id: OrderItem['id']): void
  (e: 'cancel', id: OrderItem['id']): void
  (e: 'urge'): void
  (e: 'express', id: OrderItem['id']): void
  (e: 'confirm', id: OrderItem['id']): void
  (e: 'evaluate', id: OrderItem['id']): void
  (e: 'afterSale', id: OrderItem['id']): void
}>()

/** 格式化金额显示 */
const formatAmount = (amount: number | undefined) => formatCurrency(amount ?? 0)
</script>

<style scoped>
/* ========== 订单卡片 ========== */
.order-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.4s ease-out;
  transform-origin: center;
}

.order-disappearing {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
  overflow: hidden;
}

/* ========== 订单头部 ========== */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--bg-color);
}

.order-no {
  font-size: 13px;
  color: var(--text-secondary);
}

.order-status {
  font-size: 13px;
  font-weight: 600;
}

/* ========== 状态色 ========== */
.status-0 {
  color: var(--text-secondary);
}
.status--2 {
  color: #ff464e;
}
.status-1 {
  color: #ff9500;
}
.status-2 {
  color: #07c160;
}
.status-3 {
  color: var(--primary-color);
}
.status-4 {
  color: var(--text-secondary);
}
.status--1 {
  color: #ff976a;
}
.status--3 {
  color: var(--text-placeholder);
}

/* ========== 倒计时条 ========== */
.countdown-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  margin-bottom: 4px;
  font-size: 13px;
  color: #ff6b00;
  font-weight: 500;
}

.countdown-bar .van-icon {
  font-size: 14px;
}

.countdown-label {
  opacity: 0.85;
}

.countdown-time {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

/* ========== 商品内容 ========== */
.order-content {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.order-content:active {
  opacity: 0.7;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-color);
  flex-shrink: 0;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.order-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.order-price {
  margin-top: 8px;
  text-align: right;
}

.order-price .label {
  font-size: 12px;
  color: var(--text-primary);
  margin-right: 4px;
}

.order-price .currency {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 700;
}

.order-price .amount {
  font-size: 18px;
  color: var(--primary-color);
  font-weight: 800;
}

/* ========== 操作按钮区 ========== */
.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--bg-color);
  flex-wrap: wrap;
}

.btn-detail {
  color: var(--text-secondary);
  border-color: var(--text-placeholder);
}

.btn-action {
  min-width: 80px;
}

.btn-action.primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-action.warning {
  color: #ffbe00;
  border-color: #ffbe00;
}

.btn-action.danger {
  color: var(--text-secondary);
  border-color: var(--text-placeholder);
}
</style>
