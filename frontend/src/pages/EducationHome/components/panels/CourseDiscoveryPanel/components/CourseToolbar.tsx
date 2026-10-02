import { Filter, Search, SlidersHorizontal } from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui/UiComponents'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { quickViewOptions, sortLabel, type PriceFilter, type QuickView, type SortKey } from '../../../../objects/courseDiscoveryConfig'

type CourseToolbarProps = {
  keyword: string
  categoryFilter: string
  statusFilter: 'all' | CourseStatus
  teacherFilter: string
  priceFilter: PriceFilter
  sortKey: SortKey
  quickView: QuickView
  categories: string[]
  teacherOptions: string[]
  onKeywordChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: 'all' | CourseStatus) => void
  onTeacherChange: (value: string) => void
  onPriceChange: (value: PriceFilter) => void
  onSortChange: (value: SortKey) => void
  onQuickViewChange: (value: QuickView) => void
}

export default function CourseToolbar({
  keyword,
  categoryFilter,
  statusFilter,
  teacherFilter,
  priceFilter,
  sortKey,
  quickView,
  categories,
  teacherOptions,
  onKeywordChange,
  onCategoryChange,
  onStatusChange,
  onTeacherChange,
  onPriceChange,
  onSortChange,
  onQuickViewChange,
}: CourseToolbarProps) {
  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">课程发现结果</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          <SlidersHorizontal className="mr-2 h-4 w-4 text-sky-700" />
          当前排序：{sortLabel[sortKey]}
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Filter className="h-4 w-4 text-sky-700" />
            筛选与排序
          </div>

          <div className="flex flex-wrap gap-2">
            {quickViewOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                className={
                  quickView === option.value
                    ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                    : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                }
                onClick={() => onQuickViewChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
            <label className="space-y-2">
              <span className="text-xs font-medium text-slate-500">搜索关键词</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(event) => onKeywordChange(event.target.value)}
                  placeholder="搜索课程或教师"
                  className="pl-9"
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-slate-500">分类</span>
              <select
                value={categoryFilter}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
              >
                <option value="all">全部分类</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-slate-500">状态</span>
              <select
                value={statusFilter}
                onChange={(event) => onStatusChange(event.target.value as 'all' | CourseStatus)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
              >
                <option value="all">全部状态</option>
                <option value={CourseStatus.Published}>已发布</option>
                <option value={CourseStatus.Draft}>草稿</option>
                <option value={CourseStatus.Archived}>已下架</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-slate-500">教师</span>
              <select
                value={teacherFilter}
                onChange={(event) => onTeacherChange(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
              >
                <option value="all">全部教师</option>
                {teacherOptions.map((teacherName) => (
                  <option key={teacherName} value={teacherName}>
                    {teacherName}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-slate-500">价格</span>
              <select
                value={priceFilter}
                onChange={(event) => onPriceChange(event.target.value as PriceFilter)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
              >
                <option value="all">全部价格</option>
                <option value="free">免费</option>
                <option value="paid">付费</option>
                <option value="budget">￥1 - ￥99</option>
                <option value="premium">￥100 及以上</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-slate-500">排序</span>
              <select
                value={sortKey}
                onChange={(event) => onSortChange(event.target.value as SortKey)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
              >
                <option value="popular">按热门度</option>
                <option value="latest">最新上架</option>
                <option value="rating">按评分</option>
                <option value="priceAsc">价格从低到高</option>
                <option value="priceDesc">价格从高到低</option>
              </select>
            </label>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
