/**
 * @module utils/date
 * @description 日期格式化工具，替代散落在业务里的 `new Date().toLocaleString('zh-CN')`
 */

type DateInput = Date | string | number | null | undefined

const pad = (n: number): string => String(n).padStart(2, '0')

/**
 * 格式化日期
 * @param date 日期对象/时间戳/可解析字符串，缺省为当前时间
 * @param template 模板，支持 YYYY MM DD HH mm ss
 */
const formatDate = (date: DateInput = undefined, template: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = date == null ? new Date() : new Date(date)
  if (isNaN(d.getTime())) return ''

  const map: Record<string, string | number> = {
    YYYY: d.getFullYear(),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds())
  }

  return template.replace(/YYYY|MM|DD|HH|mm|ss/g, key => String(map[key]))
}

/** 格式化为日期 + 时间（默认 YYYY-MM-DD HH:mm:ss） */
const formatDateTime = (date?: DateInput): string => formatDate(date, 'YYYY-MM-DD HH:mm:ss')

/** 格式化为仅日期（YYYY-MM-DD） */
const formatDateOnly = (date?: DateInput): string => formatDate(date, 'YYYY-MM-DD')

export { formatDate, formatDateTime, formatDateOnly, type DateInput }
