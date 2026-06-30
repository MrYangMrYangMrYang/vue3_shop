<!--
  @fileoverview 商品 SKU 选择弹窗
  @module components/product/SkuPanel
  @description 商品详情页加购/购买时弹出的规格与数量选择面板，
               展示商品图、价格、库存，支持规格选择（后端返回 specs 时渲染）与数量步进（受库存约束），
               确认后向父组件 emit quantity/specs
  @emits confirm - 用户确认时触发，payload: { quantity: number, specs: Object }
  @example
  <SkuPanel v-model="skuVisible" :product="product" @confirm="onSkuConfirm" />
-->
<template>
  <van-popup v-model:show="visible" position="bottom" round closeable teleport="body" class="sku-popup">
    <div class="sku-panel">
      <div class="sku-header">
        <img v-lazy="product.thumbs_text" class="sku-img" :alt="product.name || '商品图片'" />
        <div class="sku-meta">
          <div class="sku-price">¥{{ product.price }}</div>
          <div class="sku-stock">库存: {{ product.stock }} {{ product.unit?.name || '' }}</div>
        </div>
      </div>

      <div v-if="hasSpecs" class="sku-specs">
        <div v-for="spec in product.specs" :key="spec.name" class="spec-group">
          <div class="spec-title">{{ spec.name }}</div>
          <div class="spec-options">
            <span
              v-for="opt in spec.options"
              :key="opt"
              class="spec-option"
              :class="{ active: selectedSpecs[spec.name] === opt }"
              @click="selectSpec(spec.name, opt)"
            >
              {{ opt }}
            </span>
          </div>
        </div>
      </div>

      <div class="sku-quantity">
        <span class="quantity-label">数量</span>
        <van-stepper v-model="quantity" :min="1" :max="maxStock" integer disable-input button-size="32px" />
      </div>

      <div class="sku-footer">
        <van-button round block type="primary" :disabled="!canConfirm" @click="confirm">确定</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
defineOptions({ name: 'SkuPanel' })

import { ref, reactive, computed, watch } from 'vue'

interface SpecGroup {
  name: string
  options: string[]
}

interface ProductInfo {
  thumbs_text?: string
  price?: number | string
  stock?: number | string
  unit?: { name?: string }
  name?: string
  specs?: SpecGroup[]
  [key: string]: unknown
}

interface SkuConfirmPayload {
  quantity: number
  specs: Record<string, string>
}

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    product?: ProductInfo
  }>(),
  {
    modelValue: false,
    product: () => ({}) as ProductInfo
  }
)

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  confirm: [payload: SkuConfirmPayload]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const quantity = ref(1)
const selectedSpecs = reactive<Record<string, string>>({})

const hasSpecs = computed(() => Array.isArray(props.product.specs) && props.product.specs.length > 0)
const maxStock = computed(() => (Number(props.product.stock) > 0 ? Number(props.product.stock) : 1))
const canConfirm = computed(() => quantity.value > 0 && quantity.value <= maxStock.value)

/** 弹窗打开时重置数量与规格选择 */
watch(visible, open => {
  if (open) {
    quantity.value = 1
    Object.keys(selectedSpecs).forEach(key => {
      delete selectedSpecs[key]
    })
    if (hasSpecs.value && props.product.specs) {
      props.product.specs.forEach(spec => {
        selectedSpecs[spec.name] = spec.options[0]
      })
    }
  }
})

/** 选择规格 */
const selectSpec = (name: string, opt: string): void => {
  selectedSpecs[name] = opt
}

/** 确认选择 */
const confirm = (): void => {
  if (!canConfirm.value) return
  emit('confirm', { quantity: quantity.value, specs: { ...selectedSpecs } })
  visible.value = false
}
</script>

<style scoped>
.sku-popup {
  max-height: 80vh;
  overflow-y: auto;
}

.sku-panel {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.sku-header {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #ebedf0);
}

.sku-img {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f7f8fa;
}

.sku-meta {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
}

.sku-price {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color);
}

.sku-price::before {
  content: '¥';
  font-size: 14px;
  font-weight: 600;
}

.sku-stock {
  font-size: 12px;
  color: var(--text-secondary);
}

.sku-specs {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #ebedf0);
}

.spec-group {
  margin-bottom: 16px;
}

.spec-group:last-child {
  margin-bottom: 0;
}

.spec-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-option {
  padding: 6px 16px;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-color);
  border-radius: 14px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.spec-option.active {
  color: var(--primary-color);
  background: rgba(255, 70, 78, 0.08);
  border-color: var(--primary-color);
}

.sku-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.quantity-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

:deep(.van-stepper) {
  --van-stepper-active-color: #ff464e;
}

.sku-footer {
  padding-top: 12px;
}

:deep(.sku-footer .van-button--primary) {
  background: var(--primary-gradient);
  border: none;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.25);
}
</style>
