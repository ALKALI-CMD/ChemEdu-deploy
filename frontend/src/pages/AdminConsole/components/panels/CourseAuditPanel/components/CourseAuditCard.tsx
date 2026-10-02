import { Textarea } from '@/components/ui/UiComponents'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import { zh } from '@/lib/localization'
import AdminStatusBadge from '../../../AdminStatusBadge'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'
import CourseAuditActions from './CourseAuditActions'
import CourseAuditHistory from './CourseAuditHistory'

type CourseAuditCardProps = {
  course: Course
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

export default function CourseAuditCard({
  course,
  statusLabel,
  auditLabel,
  auditCommentDrafts,
  busyKey,
  auditLogs,
  onCommentChange,
  onAudit,
  onToggleStatus,
  onDeleteCourse,
}: CourseAuditCardProps) {
  const isBusy = busyKey === `course:${course.id}` || busyKey === `status:${course.id}` || busyKey === `delete:${course.id}`
  const canDelete = course.status !== CourseStatus.Published && course.enrolledCount === 0
  const relatedLogs = auditLogs.filter((item) => item.target.includes(zh(course.title)))

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{zh(course.title)}</p>
          <p className="text-sm text-slate-500">
            当前发布状态：{statusLabel[course.status]} / 审核状态：{auditLabel[course.auditStatus]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge label={auditLabel[course.auditStatus]} tone="info" />
          <AdminStatusBadge label={statusLabel[course.status]} tone="neutral" />
        </div>
      </div>

      <Textarea
        className="mt-4 min-h-24 bg-white"
        placeholder="填写课程审核意见"
        value={auditCommentDrafts[course.id] ?? course.auditComment ?? ''}
        onChange={(event) => onCommentChange(course.id, event.target.value)}
      />

      <div className="mt-4">
        <CourseAuditHistory course={course} relatedLogs={relatedLogs} />
      </div>

      <CourseAuditActions
        course={course}
        isBusy={isBusy}
        canDelete={canDelete}
        onAudit={onAudit}
        onToggleStatus={onToggleStatus}
        onDeleteCourse={onDeleteCourse}
      />
    </div>
  )
}
