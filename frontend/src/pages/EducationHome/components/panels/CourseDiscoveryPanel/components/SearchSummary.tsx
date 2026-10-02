import { Button } from '@/components/ui/UiComponents'
import type { PriceFilter } from '../../../../objects/courseDiscoveryConfig'

type SearchSummaryProps = {
  count: number
  keyword: string
  categoryFilter: string
  teacherFilter: string
  priceFilter: PriceFilter
  onReset: () => void
}

export default function SearchSummary({
  count,
  keyword,
  categoryFilter,
  teacherFilter,
  priceFilter,
  onReset,
}: SearchSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm text-slate-600">
          共找到 <span className="font-semibold text-slate-950">{count}</span> 门匹配课程
        </p>
        <p className="text-xs text-slate-500">
          {keyword ? `搜索词：“${keyword}”` : '当前未输入搜索词'}
          {categoryFilter !== 'all' ? ` · 分类：${categoryFilter}` : ''}
          {teacherFilter !== 'all' ? ` · 教师：${teacherFilter}` : ''}
          {priceFilter !== 'all' ? ` · 价格：${priceFilter}` : ''}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
        onClick={onReset}
      >
        清空筛选
      </Button>
    </div>
  )
}
