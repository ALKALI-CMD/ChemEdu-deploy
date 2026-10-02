import type { Course } from '@/objects/course/catalog/Course'
import { auditStatusLabel, courseStatusLabel } from '../functions/manageStatusModel'

type ManageCourseSummaryProps = {
  course: Course
  teacherName: string
  assistantNames: string
}

export default function ManageCourseSummary({ course, teacherName, assistantNames }: ManageCourseSummaryProps) {
  return (
    <>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-950">管理总览</p>
        <p className="text-sm leading-6 text-slate-600">
          查看课程状态、教学团队，以及这门课当前最值得关注的学习风险。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">课程状态</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{courseStatusLabel[course.status]}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">审核状态</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{auditStatusLabel[course.auditStatus]}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">授课团队</p>
          <p className="mt-2 font-semibold text-slate-950">{teacherName}</p>
          <p className="mt-2 text-sm text-slate-600">助教团队：{assistantNames || '暂无'}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">运营概况</p>
          <p className="mt-2 font-semibold text-slate-950">{course.enrolledCount} 人报名</p>
          <p className="mt-2 text-sm text-slate-600">
            完成率 {course.completionRate}% / 标签 {course.tags.length} 个
          </p>
        </div>
      </div>
    </>
  )
}
