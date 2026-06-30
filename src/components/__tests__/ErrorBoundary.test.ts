/**
 * @fileoverview ErrorBoundary 组件测试
 */
/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import ErrorBoundary from '../common/ErrorBoundary.vue'

/** 共享 stubs（与 NetworkError 测试保持一致） */
const stubs = {
  'van-empty': {
    template: '<div class="van-empty"><span class="desc">{{ description }}</span><slot /></div>',
    props: ['description', 'image']
  },
  'van-button': {
    template: '<button class="van-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  }
}

/** 在 render 中抛错的子组件（渲染期错误，会被 onErrorCaptured 捕获） */
const BrokenComponent = defineComponent({
  name: 'BrokenComponent',
  render() {
    throw new Error('子组件渲染异常')
    // eslint-disable-next-line no-unreachable
    return h('div')
  }
})

/** 构造测试宿主：让子组件作为 ErrorBoundary 的后代渲染 */
const buildHost = (Child: ReturnType<typeof defineComponent>) =>
  defineComponent({
    components: { ErrorBoundary, Child },
    template: `<ErrorBoundary><Child /></ErrorBoundary>`
  })

/** 挂载并等待错误捕获后的异步渲染完成 */
const mountAndFlush = async (Child: ReturnType<typeof defineComponent>) => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const wrapper = mount(buildHost(Child), { global: { stubs } })
  await nextTick()
  return { wrapper, spy }
}

describe('ErrorBoundary.vue', () => {
  it('正常状态渲染 slot 内容', () => {
    const NormalComponent = defineComponent({
      name: 'NormalComponent',
      render() {
        return h('div', { class: 'content' }, '正常内容')
      }
    })
    const wrapper = mount(buildHost(NormalComponent), { global: { stubs } })

    expect(wrapper.text()).toContain('正常内容')
    expect(wrapper.find('.van-empty').exists()).toBe(false)
  })

  it('子组件抛错时显示降级 UI', async () => {
    const { wrapper, spy } = await mountAndFlush(BrokenComponent)

    expect(wrapper.find('.van-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('页面开小差了')
    expect(wrapper.text()).toContain('重试')
    expect(wrapper.text()).toContain('刷新页面')
    spy.mockRestore()
  })

  it('点击重试后恢复渲染 slot 内容', async () => {
    let shouldThrow = true
    const FlakyComponent = defineComponent({
      name: 'FlakyComponent',
      render() {
        if (shouldThrow) {
          shouldThrow = false
          throw new Error('偶发错误')
        }
        return h('div', '已恢复')
      }
    })

    const { wrapper, spy } = await mountAndFlush(FlakyComponent)

    // 初始渲染抛错 → 降级 UI
    expect(wrapper.find('.van-empty').exists()).toBe(true)

    // 点击重试 → error 清除，FlakyComponent 第二次渲染正常
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click') // 第一个按钮是"重试"

    expect(wrapper.find('.van-empty').exists()).toBe(false)
    expect(wrapper.text()).toContain('已恢复')
    spy.mockRestore()
  })

  it('点击刷新页面调用 location.reload', async () => {
    const reloadSpy = vi.fn()
    vi.stubGlobal('location', { reload: reloadSpy })

    const { wrapper, spy } = await mountAndFlush(BrokenComponent)

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click') // 第二个按钮是"刷新页面"

    expect(reloadSpy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
    vi.unstubAllGlobals()
  })
})
