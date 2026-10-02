import type { Assignment } from '@/objects/course/learning/Assignment'

type AssignmentHistoryPanelProps = {
  assignment: Assignment
}

export default function AssignmentHistoryPanel({ assignment }: AssignmentHistoryPanelProps) {
  if (assignment.submissionHistory.length === 0 && assignment.reviewHistory.length === 0) {
    return null
  }

  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">提交记录</p>
        <div className="mt-3 space-y-2">
          {assignment.submissionHistory.map((record) => (
            <div key={`${assignment.id}-submission-${record.attemptNumber}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <p className="font-medium text-slate-900">第 {record.attemptNumber} 次 / {record.submittedAt}</p>
              <p className="mt-1 text-slate-600">
                附件 {record.attachmentCount} 份
                {record.lateSubmitted ? ' / 迟交' : ''}
                {record.submissionNote ? ` / 备注：${record.submissionNote}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">评分历史</p>
        <div className="mt-3 space-y-2">
          {assignment.reviewHistory.map((record, index) => {
            const previous = index > 0 ? assignment.reviewHistory[index - 1] : undefined
            const delta = previous ? record.finalScore - previous.finalScore : 0
            return (
              <div key={`${assignment.id}-review-${record.reviewNumber}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <p className="font-medium text-slate-900">
                  第 {record.reviewNumber} 次 / 原始 {record.rawScore} 分 / 最终 {record.finalScore} 分
                </p>
                <p className="mt-1 text-slate-600">
                  {record.reviewerName} / {record.reviewedAt}
                  {record.latePenaltyAppliedPercent > 0 ? ` / 迟交扣减 ${record.latePenaltyAppliedPercent}%` : ''}
                </p>
                {previous ? (
                  <p className="mt-1 text-xs text-slate-500">
                    与上次{delta >= 0 ? '提升' : '下降'} {Math.abs(delta)} 分
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">首次评分记录</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
