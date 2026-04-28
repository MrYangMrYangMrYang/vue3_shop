import { showToast, showFailToast } from 'vant'

/** execCommand 降级方案 */
const copyByExecCommand = (text) => {
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
 * @param {string} text
 * @param {Object} [options]
 * @param {string} [options.emptyMessage]
 * @returns {Promise<boolean>}
 */
const copyText = async (text, options = {}) => {
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

export { copyText }
