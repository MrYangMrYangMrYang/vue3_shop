/**
 * @module utils/clipboard
 * @description 剪贴板复制工具：优先 Clipboard API，降级 execCommand
 */

import { showToast, showFailToast } from 'vant'

interface CopyOptions {
  emptyMessage?: string
}

/** execCommand 降级方案 */
const copyByExecCommand = (text: string): boolean => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

/**
 * 复制文本到剪贴板
 * @param text 待复制内容
 * @param options 配置项
 * @param options.emptyMessage 空值时的提示文案
 */
const copyText = async (text: unknown, options: CopyOptions = {}): Promise<boolean> => {
  const value = String(text || '')
  const emptyMessage = options.emptyMessage || '暂无可复制内容'

  if (!value) {
    showFailToast(emptyMessage)
    return false
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      showToast('复制成功')
      return true
    }
  } catch (error) {}

  const copied = copyByExecCommand(value)
  if (copied) {
    showToast('复制成功')
    return true
  }

  showFailToast('复制失败，请手动复制')
  return false
}

export { copyText, type CopyOptions }
