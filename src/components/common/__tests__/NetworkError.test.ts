/**
 * @fileoverview NetworkError 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NetworkError from '../NetworkError.vue'

/** 共享 stubs */
const stubs = {
  'van-empty': {
    template: '<div><span class="desc">{{ description }}</span><slot /></div>',
    props: ['description', 'image']
  },
  'van-button': {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  }
}

describe('NetworkError.vue', () => {
  it('渲染默认错误信息', () => {
    const wrapper = mount(NetworkError, { global: { stubs } })

    expect(wrapper.text()).toContain('网络异常，请稍后重试')
    expect(wrapper.text()).toContain('重新加载')
  })

  it('支持自定义 props', () => {
    const wrapper = mount(NetworkError, {
      props: { description: '自定义错误描述', buttonText: '点击重试' },
      global: { stubs }
    })

    expect(wrapper.text()).toContain('自定义错误描述')
    expect(wrapper.text()).toContain('点击重试')
  })

  it('点击重试按钮触发 retry 事件', async () => {
    const wrapper = mount(NetworkError, { global: { stubs } })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.emitted('retry')!.length).toBe(1)
  })
})
