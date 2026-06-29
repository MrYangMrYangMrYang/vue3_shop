import { describe, it, expect, vi, beforeEach } from 'vitest'
import { copyText } from '../clipboard'

describe('copyText', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('空值提示并返回 false', async () => {
    const result = await copyText('')
    expect(result).toBe(false)
  })

  it('null/undefined 视为空值返回 false', async () => {
    expect(await copyText(null)).toBe(false)
    expect(await copyText(undefined)).toBe(false)
  })

  it('navigator.clipboard 可用时写入剪贴板', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })

    const result = await copyText('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result).toBe(true)
  })

  it('clipboard API 不可用时降级 execCommand', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true })

    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })

    const result = await copyText('fallback')
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(result).toBe(true)
  })

  it('所有方案均失败时返回 false', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true })
    Object.defineProperty(document, 'execCommand', { value: vi.fn().mockReturnValue(false), configurable: true })

    const result = await copyText('test')
    expect(result).toBe(false)
  })
})
