/**
 * @module utils/debounce
 * @description 防抖函数：在连续调用停止后才执行最后一次
 */

/**
 * 泛型函数约束类型：never 是 bottom type，任何函数类型都 extends (...args: never[]) => void
 * 用作泛型 T 的约束，确保 T 是函数同时保留其原始参数签名供 Parameters<T> 推导
 */
type AnyFn = (...args: never[]) => void

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
