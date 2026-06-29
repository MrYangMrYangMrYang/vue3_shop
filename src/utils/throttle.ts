/**
 * @module utils/throttle
 * @description 节流函数：在 wait 时间内仅执行一次首次调用，后续调用被丢弃。
 *              与 debounce 的区别：debounce 等空闲，throttle 按固定频率触发
 */

type AnyFn = (...args: any[]) => void

/**
 * @param fn 目标函数
 * @param wait 节流窗口（毫秒），默认 300
 * @param leading 是否在窗口起点立即触发，默认 true
 */
function throttle<T extends AnyFn>(
  fn: T,
  wait: number = 300,
  leading: boolean = true
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()

    if (lastTime === 0 && !leading) {
      lastTime = now
    }

    const remaining = wait - (now - lastTime)

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

export { throttle, type AnyFn }
