import type { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { PriceFilter, QuickView, SortKey } from '../../../../objects/courseDiscoveryConfig'
import CourseToolbar from './CourseToolbar'
import SearchSummary from './SearchSummary'

type QuickFiltersSectionProps = {
  keyword: string
  categoryFilter: string
  statusFilter: 'all' | CourseStatus
  teacherFilter: string
  priceFilter: PriceFilter
  sortKey: SortKey
  quickView: QuickView
  categories: string[]
  teacherOptions: string[]
  resultCount: number
  onKeywordChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: 'all' | CourseStatus) => void
  onTeacherChange: (value: string) => void
  onPriceChange: (value: PriceFilter) => void
  onSortChange: (value: SortKey) => void
  onQuickViewChange: (value: QuickView) => void
  onReset: () => void
}

export default function QuickFiltersSection(props: QuickFiltersSectionProps) {
  const {
    keyword,
    categoryFilter,
    statusFilter,
    teacherFilter,
    priceFilter,
    sortKey,
    quickView,
    categories,
    teacherOptions,
    resultCount,
    onKeywordChange,
    onCategoryChange,
    onStatusChange,
    onTeacherChange,
    onPriceChange,
    onSortChange,
    onQuickViewChange,
    onReset,
  } = props

  return (
    <div className="space-y-5">
      <CourseToolbar
        keyword={keyword}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        teacherFilter={teacherFilter}
        priceFilter={priceFilter}
        sortKey={sortKey}
        quickView={quickView}
        categories={categories}
        teacherOptions={teacherOptions}
        onKeywordChange={onKeywordChange}
        onCategoryChange={onCategoryChange}
        onStatusChange={onStatusChange}
        onTeacherChange={onTeacherChange}
        onPriceChange={onPriceChange}
        onSortChange={onSortChange}
        onQuickViewChange={onQuickViewChange}
      />

      <SearchSummary
        count={resultCount}
        keyword={keyword}
        categoryFilter={categoryFilter}
        teacherFilter={teacherFilter}
        priceFilter={priceFilter}
        onReset={onReset}
      />
    </div>
  )
}
