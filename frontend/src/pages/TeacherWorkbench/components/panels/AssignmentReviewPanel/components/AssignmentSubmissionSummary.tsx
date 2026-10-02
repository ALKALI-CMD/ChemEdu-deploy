import type { Assignment } from '@/objects/course/learning/Assignment'
import { Badge } from '@/components/ui/UiComponents'
import ReviewAttachmentList from './ReviewAttachmentList'
import { text } from '../functions/teacherReviewUtils'

type AssignmentSubmissionSummaryProps = {
  assignment: Assignment
}

export default function AssignmentSubmissionSummary({ assignment }: AssignmentSubmissionSummaryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
          已提交 {assignment.attemptCount} / {assignment.maxAttempts} 次
        </Badge>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
          重交 {assignment.resubmissionCount} 次
        </Badge>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
          {assignment.allowLateSubmission ? '允许迟交' : '不允许迟交'}
        </Badge>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
          {assignment.allowResubmission ? '允许重做' : '不允许重做'}
        </Badge>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
          {assignment.allowMakeUpSubmission ? '允许补交' : '不允许补交'}
        </Badge>
        {assignment.latePenaltyPercentPerDay > 0 ? (
          <Badge variant="secondary" className="rounded-full bg-rose-100 text-rose-800">
            迟交每天扣减 {assignment.latePenaltyPercentPerDay}% / 上限 {assignment.latePenaltyCapPercent}%
          </Badge>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-900">学生提交内容</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text(assignment.submissionContent) || '学生暂未提交文本内容。'}
      </p>
      <div className="mt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">学生提交附件</p>
        <ReviewAttachmentList attachments={assignment.submissionAttachments ?? []} emptyLabel="学生暂未上传附件" />
      </div>
    </div>
  )
}
