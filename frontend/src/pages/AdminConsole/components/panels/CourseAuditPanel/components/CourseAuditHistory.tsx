import type { Course } from '@/objects/course/catalog/Course'
import { zh } from '@/lib/localization'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'

type CourseAuditHistoryProps = {
  course: Course
  relatedLogs: OperationLogItem[]
}

export default function CourseAuditHistory({ course, relatedLogs }: CourseAuditHistoryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">批注历史</p>
      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        <p>最近审核人：{course.auditedBy ? zh(course.auditedBy) : '暂无'}</p>
        <p>最近审核时间：{course.auditedAt ? course.auditedAt : '暂无'}</p>
        <p>最近审核意见：{course.auditComment ? zh(course.auditComment) : '暂无'}</p>
        {relatedLogs.length > 0 ? (
          <div className="rounded-2xl bg-slate-50 p-3">
            {relatedLogs.slice(0, 3).map((item) => (
              <p key={item.id} className="text-xs text-slate-500">
                {item.createdAt} / {item.action}
                {item.detail ? ` / ${item.detail}` : ''}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
