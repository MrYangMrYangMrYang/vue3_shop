/**
 * @fileoverview 第三方库类型补丁
 * @description @vant/area-data 的 package.json exports 未正确指向 .d.ts 类型文件，
 *              导致 TS7016（模块隐式 any）。在此声明 ambient 模块类型以补全类型链路。
 *              本文件为脚本文件（无 top-level import/export），确保 declare module 生效为 ambient 声明。
 */

declare module '@vant/area-data' {
  export const areaList: {
    province_list: Record<string, string>
    city_list: Record<string, string>
    county_list: Record<string, string>
  }
}
