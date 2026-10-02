import type { Assignment } from '@/objects/course/learning/Assignment'
import { Badge } from '@/components/ui/UiComponents'

type AssignmentRuleBadgesProps = {
  assignment: Assignment
}

export default function AssignmentRuleBadges({ assignment }: AssignmentRuleBadgesProps) {
  const remainingAttempts = Math.max(0, assignment.maxAttempts - assignment.attemptCount)

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
      <Badge variant="secondary" className="rounded-full bg-slate-950 text-white hover:bg-slate-950">
        教师提交规则
      </Badge>
      <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
        已提交 {assignment.attemptCount} / {assignment.maxAttempts} 次
      </Badge>
      <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
        重交 {assignment.resubmissionCount} 次
      </Badge>
      <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
        剩余尝试 {remainingAttempts} 次
      </Badge>
      <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
        {assignment.allowLateSubmission ? '允许迟交' : '不允许迟交'}
      </Badge>
      <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
        {assignment.allowResubmission ? '允许重新提交' : '只能提交一次'}
      </Badge>
      <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
        {assignment.allowMakeUpSubmission ? '允许补交' : '不允许补交'}
      </Badge>
      {assignment.lateSubmissionDeadline ? (
        <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
          补交截止 {assignment.lateSubmissionDeadline}
        </Badge>
      ) : null}
      {assignment.latePenaltyPercentPerDay > 0 ? (
        <Badge variant="secondary" className="rounded-full bg-rose-100 text-rose-800">
          迟交每天扣减 {assignment.latePenaltyPercentPerDay}% / 上限 {assignment.latePenaltyCapPercent}%
        </Badge>
      ) : null}
      {assignment.rubric.length > 0 ? (
        <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
          评分规则 {assignment.rubric.length} 项
        </Badge>
      ) : null}
    </div>
  )
}
