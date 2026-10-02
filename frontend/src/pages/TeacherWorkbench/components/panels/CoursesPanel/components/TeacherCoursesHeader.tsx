import { CardHeader, CardTitle, Input } from '@/components/ui/UiComponents'
import type { CourseFilter } from '../functions/teacherCourseUtils'

type TeacherCoursesHeaderProps = {
  keyword: string
  onKeywordChange: (value: string) => void
  filter: CourseFilter
  onFilterChange: (value: CourseFilter) => void
  filterLabel: Record<CourseFilter, string>
  filterCounts: Record<CourseFilter, number>
}

export default function TeacherCoursesHeader({
  keyword,
  onKeywordChange,
  filter,
  onFilterChange,
  filterLabel,
  filterCounts,
}: TeacherCoursesHeaderProps) {
  return (
    <CardHeader className="space-y-4">
      <div className="space-y-1">
        <CardTitle className="text-slate-950">课程管理</CardTitle>
      </div>

      <Input
        className="bg-white"
        placeholder="搜索课程标题、分类、教师或教学安排"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(filterLabel) as CourseFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            className={
              filter === value
                ? 'inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800'
                : 'inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-100'
            }
            onClick={() => onFilterChange(value)}
          >
            {filterLabel[value]} {filterCounts[value]}
          </button>
        ))}
      </div>
    </CardHeader>
  )
}
