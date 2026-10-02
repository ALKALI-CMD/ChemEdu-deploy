import type { Assignment } from '@/objects/course/learning/Assignment'

type AssignmentLatestReviewDeltaProps = {
  assignment: Assignment
}

export default function AssignmentLatestReviewDelta({ assignment }: AssignmentLatestReviewDeltaProps) {
  const latestReview = assignment.reviewHistory.at(-1)
  const previousReview = assignment.reviewHistory.length > 1 ? assignment.reviewHistory.at(-2) : null

  if (!latestReview) {
    return null
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      <p className="font-medium text-slate-900">最近一次评分对比</p>
      <p className="mt-1">
        本次最终得分 {latestReview.finalScore} 分
        {previousReview
          ? `，较上次 ${latestReview.finalScore - previousReview.finalScore >= 0 ? '提升' : '下降'} ${Math.abs(latestReview.finalScore - previousReview.finalScore)} 分。`
          : '。'}
      </p>
    </div>
  )
}
