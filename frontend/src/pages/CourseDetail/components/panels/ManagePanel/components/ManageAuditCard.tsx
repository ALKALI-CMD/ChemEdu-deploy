import type { Course } from '@/objects/course/catalog/Course'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { Card, CardContent } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

type ManageAuditCardProps = {
  course: Course
}

const auditStatusLabel: Record<CourseAuditStatus, string> = {
  [CourseAuditStatus.Pending]: '待审核',
  [CourseAuditStatus.Approved]: '已通过',
  [CourseAuditStatus.Rejected]: '已驳回',
}

export default function ManageAuditCard({ course }: ManageAuditCardProps) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">审核信息</p>
          <p className="text-sm leading-6 text-slate-600">
            这里单独展示审核结果和审核说明，避免把编辑表单、课程元信息和状态操作都挤在一起。
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>审核结果：{auditStatusLabel[course.auditStatus]}</p>
          <p>审核意见：{course.auditComment ? zh(course.auditComment) : '当前还没有审核意见。'}</p>
          <p>审核记录：{course.auditedBy ? `${zh(course.auditedBy)} / ${course.auditedAt ?? '时间待记录'}` : '暂无'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
