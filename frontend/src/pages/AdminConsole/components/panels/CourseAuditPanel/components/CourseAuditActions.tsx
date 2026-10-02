import { Button } from '@/components/ui/UiComponents'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'

type CourseAuditActionsProps = {
  course: Course
  isBusy: boolean
  canDelete: boolean
  onAudit: (courseId: Course['id'], auditStatus: CourseAuditStatus) => Promise<void>
  onToggleStatus: (courseId: Course['id'], status: CourseStatus) => Promise<void>
  onDeleteCourse: (courseId: Course['id']) => Promise<void>
}

export default function CourseAuditActions({
  course,
  isBusy,
  canDelete,
  onAudit,
  onToggleStatus,
  onDeleteCourse,
}: CourseAuditActionsProps) {
  const nextStatus = course.status === CourseStatus.Published ? CourseStatus.Archived : CourseStatus.Published

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        {course.enrolledCount > 0 ? `当前报名人数：${course.enrolledCount}` : '当前还没有学生报名'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" disabled={isBusy} onClick={() => void onAudit(course.id, CourseAuditStatus.Pending)}>
          退回待审核
        </Button>
        <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500" disabled={isBusy} onClick={() => void onAudit(course.id, CourseAuditStatus.Approved)}>
          审核通过
        </Button>
        <Button type="button" className="rounded-full bg-rose-600 text-white hover:bg-rose-500" disabled={isBusy} onClick={() => void onAudit(course.id, CourseAuditStatus.Rejected)}>
          驳回课程
        </Button>
        <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" disabled={isBusy} onClick={() => void onToggleStatus(course.id, nextStatus)}>
          {course.status === CourseStatus.Published ? '下架课程' : '上架课程'}
        </Button>
        <Button
          type="button"
          className="rounded-full bg-red-600 text-white hover:bg-red-500 disabled:bg-slate-300"
          disabled={isBusy || !canDelete}
          title={canDelete ? '删除无效课程' : '仅可删除未发布且无人报名的课程'}
          onClick={() => void onDeleteCourse(course.id)}
        >
          删除课程
        </Button>
      </div>
    </div>
  )
}
