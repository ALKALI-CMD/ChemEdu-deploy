import type { Assignment } from '@/objects/course/learning/Assignment'
import { zh } from '@/lib/localization'
import AttachmentList from './AttachmentList'

type AssignmentFeedbackPanelProps = {
  assignment: Assignment
}

export default function AssignmentFeedbackPanel({ assignment }: AssignmentFeedbackPanelProps) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">批改反馈</p>
      <p className="mt-2 text-sm text-slate-600">
        {assignment.score !== undefined ? `最终分数：${assignment.score}` : '尚未评分'}
        {assignment.rawScore !== undefined && assignment.rawScore !== assignment.score ? ` / 原始分：${assignment.rawScore}` : ''}
        {assignment.latePenaltyAppliedPercent > 0 ? ` / 迟交扣减：${assignment.latePenaltyAppliedPercent}%` : ''}
        {assignment.feedback ? ` / 评语：${zh(assignment.feedback)}` : ''}
        {assignment.submittedAt ? ` / 提交时间：${assignment.submittedAt}` : ''}
        {assignment.reviewedAt ? ` / 批改时间：${assignment.reviewedAt}` : ''}
      </p>
      <div className="mt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">教师反馈附件</p>
        <AttachmentList attachments={assignment.reviewAttachments ?? []} emptyLabel="教师暂未上传反馈附件" />
      </div>
    </div>
  )
}
