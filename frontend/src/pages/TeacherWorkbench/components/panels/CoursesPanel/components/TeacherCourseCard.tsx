import { Link } from 'react-router-dom'
import type { Course } from '@/objects/course/catalog/Course'
import { Button, Checkbox } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'
import TeacherStatusBadge from './teacher/TeacherStatusBadge'

type TeacherCourseCardProps = {
  course: Course
  checked: boolean
  canManage: boolean
  selectedCourseId?: string | null
  onToggleCourseSelection: (courseId: string) => void
  onSelectCourse: (courseId: string) => void
  onToggleStatus: (course: Course) => Promise<void>
  statusLabel: Record<Course['status'], string>
  auditLabel: Record<Course['auditStatus'], string>
}

export default function TeacherCourseCard({
  course,
  checked,
  canManage,
  selectedCourseId,
  onToggleCourseSelection,
  onSelectCourse,
  onToggleStatus,
  statusLabel,
  auditLabel,
}: TeacherCourseCardProps) {
  void onSelectCourse
  return (
    <div
      className={`rounded-3xl border p-4 transition ${
        selectedCourseId === course.id ? 'border-sky-300 bg-sky-50/70 shadow-sm' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={() => onToggleCourseSelection(course.id)}
            aria-label={`选择课程 ${zh(course.title)}`}
            className="mt-1"
          />
          <div className="space-y-1">
            <p className="font-semibold text-slate-950">{zh(course.title)}</p>
            <p className="text-sm text-slate-500">
              {zh(course.category)} / {zh(course.schedule)}
            </p>
            <p className="text-sm text-slate-500">
              报名 {course.enrolledCount} 人 / 完成度 {course.completionRate}% / {course.modules.length} 个章节
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TeacherStatusBadge label={statusLabel[course.status]} tone="neutral" />
          <TeacherStatusBadge label={auditLabel[course.auditStatus]} tone="info" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
        >
          <Link to={`/teacher/courses/${course.id}`}>编辑课程</Link>
        </Button>
        {canManage ? (
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            onClick={() => void onToggleStatus(course)}
          >
            {course.status === 'published' ? '下架课程' : '提交发布 / 重新上架课程'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
