import type { Course } from '@/objects/course/catalog/Course'

type ReviewFilter = 'all' | 'submitted' | 'reviewed'

type AssignmentReviewHeaderProps = {
  courses: Course[]
  courseFilter: string
  setCourseFilter: (value: string) => void
  statusFilter: ReviewFilter
  setStatusFilter: (value: ReviewFilter) => void
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export default function AssignmentReviewHeader({
  courses,
  courseFilter,
  setCourseFilter,
  statusFilter,
  setStatusFilter,
}: AssignmentReviewHeaderProps) {
  return (
    <>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-slate-950">批改反馈</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700"
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
        >
          <option value="all">全部课程</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {text(course.title)}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ReviewFilter)}
        >
          <option value="all">全部状态</option>
          <option value="submitted">只看待批改</option>
          <option value="reviewed">只看已批改</option>
        </select>
      </div>
    </>
  )
}
