import { Button } from '@/components/ui/UiComponents'

type AuditFilter = 'all' | 'pending' | 'approved' | 'rejected'

const filterLabel: Record<AuditFilter, string> = {
  all: '全部',
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

type CourseAuditFiltersProps = {
  filter: AuditFilter
  setFilter: (value: AuditFilter) => void
  filterCounts: Record<AuditFilter, number>
}

export default function CourseAuditFilters({ filter, setFilter, filterCounts }: CourseAuditFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(filterLabel) as AuditFilter[]).map((value) => (
        <Button
          key={value}
          type="button"
          variant="outline"
          className={
            filter === value
              ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
              : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
          }
          onClick={() => setFilter(value)}
        >
          {filterLabel[value]} {filterCounts[value]}
        </Button>
      ))}
    </div>
  )
}
