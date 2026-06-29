/**
 * @module utils/debounce
 * @description 防抖函数：在连续调用停止后才执行最后一次
 */

type AnyFn = (...args: any[]) => void

/**
 * @param fn 目标函数
 * @param delay 延迟毫秒，默认 300
 */
function debounce<T extends AnyFn>(fn: T, delay: number = 300): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

export { debounce, type AnyFn }
