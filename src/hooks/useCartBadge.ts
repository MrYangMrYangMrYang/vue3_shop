/**
 * @module hooks/useCartBadge
 * @description 购物车角标计算：后端全量件数 - 待付款订单占用件数
 *              待付款订单的商品在购物车中仅隐藏未删除，角标需扣除占用部分避免重复计数
 */

import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { usePendingPaymentStore } from '@/stores/pendingPayment'

/** 返回购物车角标应显示的数量（不低于 0） */
export function useCartBadge() {
  const cartStore = useCartStore()
  const pendingPaymentStore = usePendingPaymentStore()
  return computed(() => Math.max(0, cartStore.count - pendingPaymentStore.occupiedCount))
}
