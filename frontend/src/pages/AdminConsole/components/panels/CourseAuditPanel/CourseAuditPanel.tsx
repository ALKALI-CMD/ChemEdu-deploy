import { Link } from 'react-router-dom'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import CourseAuditCard from './components/CourseAuditCard'
import CourseAuditFilters from './components/CourseAuditFilters'
import AdminEmptyState from '../../AdminEmptyState'
import AdminPanelShell from '../../AdminPanelShell'
import { useCourseAuditFilters } from './hooks/useCourseAuditFilters'
import type { OperationLogItem } from '../../../objects/adminConsoleConfig'

type CourseAuditPanelProps = {
  courses: Course[]
  detailCourseId?: string
  statusLabel: Record<string, string>
  auditLabel: Record<CourseAuditStatus, string>
  auditCommentDrafts: Record<string, string>
  busyKey: string | null
  auditLogs: OperationLogItem[]
  onCommentChange: (courseId: Course['id'], value: string) => void
  onAudit: (courseId: Course['id'], auditStatus: CourseAuditStatus) => Promise<void>
  onToggleStatus: (courseId: Course['id'], status: CourseStatus) => Promise<void>
  onDeleteCourse: (courseId: Course['id']) => Promise<void>
}

export default function CourseAuditPanel({
  courses,
  detailCourseId,
  statusLabel,
  auditLabel,
  auditCommentDrafts,
  busyKey,
  auditLogs,
  onCommentChange,
  onAudit,
  onToggleStatus,
  onDeleteCourse,
}: CourseAuditPanelProps) {
  const { filter, setFilter, filterCounts, filteredCourses } = useCourseAuditFilters(courses)
  const detailCourse = detailCourseId ? courses.find((course) => course.id === detailCourseId) : null

  return (
    <AdminPanelShell
      title="课程审核"
      description="按状态查看课程审核项。"
      headerExtras={<CourseAuditFilters filter={filter} setFilter={setFilter} filterCounts={filterCounts} />}
    >
      {detailCourse ? (
        <CourseAuditCard
          key={detailCourse.id}
          course={detailCourse}
          statusLabel={statusLabel}
          auditLabel={auditLabel}
          auditCommentDrafts={auditCommentDrafts}
          busyKey={busyKey}
          auditLogs={auditLogs}
          onCommentChange={onCommentChange}
          onAudit={onAudit}
          onToggleStatus={onToggleStatus}
          onDeleteCourse={onDeleteCourse}
        />
      ) : (
        <>
          {filteredCourses.length === 0 ? <AdminEmptyState message="当前筛选条件下没有可处理的课程审核项。" /> : null}
          {filteredCourses.map((course) => (
            <Link key={course.id} to={`/admin/audits/${course.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{String(course.title)}</p>
                  <p className="mt-1 text-sm text-slate-500">报名 {course.enrolledCount} 人 / {String(course.category)}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">{auditLabel[course.auditStatus]}</span>
                  <span className="rounded-full bg-white px-3 py-1">{statusLabel[course.status]}</span>
                </div>
              </div>
            </Link>
          ))}
        </>
      )}
    </AdminPanelShell>
  )
}
