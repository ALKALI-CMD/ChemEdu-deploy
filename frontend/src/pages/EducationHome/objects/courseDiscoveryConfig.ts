// 文件说明：定义业务courseDiscovery配置领域数据类型，用于业务流程和接口传输。
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'

export type PriceFilter = 'all' | 'free' | 'paid' | 'budget' | 'premium'
export type SortKey = 'popular' | 'latest' | 'priceAsc' | 'priceDesc' | 'rating'
export type QuickView = 'all' | 'popular' | 'latest' | 'free' | 'rating'

export const courseStatusLabel: Record<CourseStatus, string> = {
  [CourseStatus.Published]: '已发布',
  [CourseStatus.Draft]: '草稿',
  [CourseStatus.Archived]: '已下架',
}

export const sortLabel: Record<SortKey, string> = {
  popular: '按热门度',
  latest: '最新上架',
  priceAsc: '价格从低到高',
  priceDesc: '价格从高到低',
  rating: '按评分',
}

export const quickViewOptions: Array<{ value: QuickView; label: string }> = [
  { value: 'all', label: '全部课程' },
  { value: 'popular', label: '热门课程' },
  { value: 'latest', label: '最新上架' },
  { value: 'free', label: '免费课程' },
  { value: 'rating', label: '高评分' },
]

export function courseDiscoveryText(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export function getCoursePriceLabel(price: number) {
  if (price === 0) {
    return '免费'
  }
  return `￥${price}`
}

export function getCourseStatusTone(status: CourseStatus) {
  if (status === CourseStatus.Published) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50'
  }
  if (status === CourseStatus.Draft) {
    return 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50'
  }
  return 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100'
}
