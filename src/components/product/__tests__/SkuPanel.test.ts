/**
 * @fileoverview SkuPanel 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkuPanel from '../SkuPanel.vue'

/** Vant 组件简易 stub */
const stubs = {
  'van-popup': {
    template: '<div v-if="show"><slot /></div>',
    props: ['show', 'position', 'round', 'closeable', 'teleport'],
    emits: ['update:show']
  },
  'van-stepper': {
    template: '<div class="mock-stepper"><span class="val">{{ modelValue }}</span></div>',
    props: ['modelValue', 'min', 'max', 'integer', 'disableInput', 'buttonSize'],
    emits: ['update:modelValue']
  },
  'van-button': {
    template: '<button class="confirm-btn" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['round', 'block', 'type', 'disabled'],
    emits: ['click']
  }
}

const baseProduct = {
  thumbs_text: '/test.jpg',
  price: '99.00',
  stock: 100,
  unit: { name: '件' },
  specs: [
    { name: '颜色', options: ['红', '蓝'] },
    { name: '尺寸', options: ['S', 'M', 'L'] }
  ]
}

describe('SkuPanel.vue', () => {
  it('弹窗关闭时不渲染内容', () => {
    const wrapper = mount(SkuPanel, {
      props: { modelValue: false, product: baseProduct },
      global: { stubs }
    })
    expect(wrapper.html()).not.toContain('sku-panel')
  })

  /**
   * 辅助函数：挂载 SkuPanel 并触发弹窗打开（规格初始化依赖 watch visible 回调）
   */
  function mountOpen(product: Record<string, unknown> = baseProduct) {
    const wrapper = mount(SkuPanel, {
      props: { modelValue: false, product },
      global: { stubs }
    })
    // 先关闭再打开，触发 watch(visible) 初始化规格
    wrapper.setProps({ modelValue: true })
    return wrapper
  }

  it('展示商品价格和库存', async () => {
    const wrapper = mountOpen()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('99.00')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('件')
  })

  it('渲染规格选项', async () => {
    const wrapper = mountOpen()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('颜色')
    expect(wrapper.text()).toContain('红')
    expect(wrapper.text()).toContain('蓝')
    expect(wrapper.text()).toContain('尺寸')
  })

  it('无规格时跳过规格渲染', async () => {
    const noSpecProduct = { ...baseProduct, specs: [] }
    const wrapper = mountOpen(noSpecProduct)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('颜色')
    expect(wrapper.text()).not.toContain('尺寸')
  })

  it('点击确认按钮 emit confirm 事件', async () => {
    const wrapper = mountOpen()
    await wrapper.vm.$nextTick()

    await wrapper.find('.confirm-btn').trigger('click')
    const emitted = wrapper.emitted('confirm')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({
      quantity: 1,
      specs: { 颜色: '红', 尺寸: 'S' }
    })
  })
})
