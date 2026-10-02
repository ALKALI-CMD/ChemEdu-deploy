import type { Assignment } from '@/objects/course/learning/Assignment'
import { Badge } from '@/components/ui/UiComponents'
import { scoreDeltaLabel, text } from '../functions/teacherReviewUtils'

type AssignmentReviewHistoryProps = {
  assignment: Assignment
}

export default function AssignmentReviewHistory({ assignment }: AssignmentReviewHistoryProps) {
  const latestReview = assignment.reviewHistory.at(-1)
  const previousReview = assignment.reviewHistory.length > 1 ? assignment.reviewHistory.at(-2) : undefined
  const latestSubmission = assignment.submissionHistory.at(-1)
  const previousSubmission = assignment.submissionHistory.length > 1 ? assignment.submissionHistory.at(-2) : undefined

  if (assignment.reviewHistory.length === 0 && assignment.submissionHistory.length === 0) {
    return null
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">评分历史时间线</p>
        <div className="mt-3 space-y-3">
          {assignment.reviewHistory.map((record) => (
            <div key={`${assignment.id}-review-${record.reviewNumber}`} className="rounded-2xl bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-950">第 {record.reviewNumber} 次评分</p>
                <Badge className="rounded-full bg-slate-950 text-white hover:bg-slate-950">
                  {record.finalScore} 分
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {record.reviewerName} / {record.reviewedAt}
              </p>
              <p className="mt-2 text-sm text-slate-600">{text(record.feedback)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">重交前后版本对比</p>
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-white p-3">
            <p className="font-medium text-slate-950">最近一次提交</p>
            {latestSubmission ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  第 {latestSubmission.attemptNumber} 次 / {latestSubmission.submittedAt}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  预览：{text(latestSubmission.submissionContentPreview) || '无文本预览'}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  附件 {latestSubmission.attachmentCount} 个 / {latestSubmission.lateSubmitted ? '迟交' : '按时'}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">暂无提交记录。</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-3">
            <p className="font-medium text-slate-950">上一版对比</p>
            {previousSubmission ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  第 {previousSubmission.attemptNumber} 次 / {previousSubmission.submittedAt}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  预览：{text(previousSubmission.submissionContentPreview) || '无文本预览'}
                </p>
                <p className="mt-2 text-sm text-slate-600">附件 {previousSubmission.attachmentCount} 个</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">这是第一次提交，没有更早版本可比较。</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-3">
            <p className="font-medium text-slate-950">最近评分变化</p>
            {latestReview ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  {scoreDeltaLabel(latestReview.finalScore, previousReview?.finalScore)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  原始分 {latestReview.rawScore} / 最终分 {latestReview.finalScore}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  迟交扣分 {latestReview.latePenaltyAppliedPercent}% / {latestReview.latePenaltyAppliedPoints} 分
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">还没有评分记录。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
