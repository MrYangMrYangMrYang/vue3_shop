/**
 * @fileoverview NotFound 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const mockReplace = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mockReplace })
}))

import NotFound from '../NotFound.vue'

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

describe('NotFound.vue', () => {
  it('渲染 404 提示并显示返回首页按钮', () => {
    const wrapper = mount(NotFound, { global: { stubs } })

    expect(wrapper.text()).toContain('页面走丢了')
    expect(wrapper.text()).toContain('返回首页')
  })

  it('点击返回首页按钮调用 router.replace(/)', async () => {
    const wrapper = mount(NotFound, { global: { stubs } })

    await wrapper.find('button').trigger('click')
    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})
