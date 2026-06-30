/**
 * @fileoverview Vant 组件库类型扩展入口
 * @description Vant 4 已知类型 bug：van-skeleton-paragraph 的 row-width 文档支持数组格式
 *              （用于设置多行不同宽度），但 prop 声明仅限 Number | String，
 *              实际样式渲染正常但会触发模板 prop 校验警告。
 *              解决由两层构成：
 *              1) TypeScript 层：模板内用 `as unknown as string` 类型断言桥接（详见各 .vue 文件注释）
 *              2) 运行时层：main.ts 的 warnHandler 过滤该特定警告（精确匹配 prop 名避免误伤）
 *              待 Vant 上游修复后可移除本文件和 main.ts warnHandler 中相关代码。
 * @see https://github.com/youzan/vant/issues/12041
 */

export {}
