import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import { Badge, Button } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'
import { assignmentStatusLabel, isDeadlinePassed } from '../functions/assignmentPanelModel'
import AssignmentFeedbackPanel from './AssignmentFeedbackPanel'
import AssignmentHistoryPanel from './AssignmentHistoryPanel'
import AssignmentLatestReviewDelta from './AssignmentLatestReviewDelta'
import AssignmentRubricScores from './AssignmentRubricScores'
import AssignmentRuleBadges from './AssignmentRuleBadges'
import AssignmentSubmissionEditor from './AssignmentSubmissionEditor'
import AssignmentTeacherAnnotations from './AssignmentTeacherAnnotations'

type AssignmentSubmissionDetailProps = {
  assignment: Assignment
  focusAssignmentId?: string
  currentDraft: string
  draftAttachments: AssignmentAttachment[]
  submittingKey: string | null
  onDraftChange: (assignmentId: string, value: string) => void
  onAttachmentSelect: (assignmentId: string, files: FileList | null) => Promise<void>
  onAttachmentClear: (assignmentId: string) => void
  onSubmit: (assignmentId: string, draftValue: string, attachments: AssignmentAttachment[]) => Promise<void>
}

export default function AssignmentSubmissionDetail({
  assignment,
  focusAssignmentId,
  currentDraft,
  draftAttachments,
  submittingKey,
  onDraftChange,
  onAttachmentSelect,
  onAttachmentClear,
  onSubmit,
}: AssignmentSubmissionDetailProps) {
  const submitLabel = assignment.submissionStatus === SubmissionStatus.Reviewed || assignment.attemptCount > 0 ? '重新提交' : '提交作业'
  const completed = assignment.submissionStatus !== SubmissionStatus.Pending
  const reviewed = assignment.submissionStatus === SubmissionStatus.Reviewed
  const deadlinePassed = isDeadlinePassed(String(assignment.deadline))

  return (
    <div
      id={`assignment-${assignment.id}`}
      className={`rounded-lg border border-slate-200 bg-slate-50 p-4 transition ${
        focusAssignmentId === assignment.id ? 'ring-2 ring-amber-300 shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950">{zh(assignment.title)}</p>
          <p className="text-sm text-slate-500">截止时间：{assignment.deadline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
            {assignmentStatusLabel[assignment.submissionStatus]}
          </Badge>
          <Badge className={completed ? 'rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100' : 'rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100'}>
            {completed ? '已完成' : '未完成'}
          </Badge>
          <Badge className={reviewed ? 'rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100' : 'rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100'}>
            {reviewed ? '已批改' : '未批改'}
          </Badge>
          <Badge className={deadlinePassed ? 'rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100' : 'rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-50'}>
            {deadlinePassed ? '已截止' : '未截止'}
          </Badge>
          {assignment.lateSubmitted ? (
            <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-900">
              已迟交
            </Badge>
          ) : null}
          {assignment.canResubmit ? (
            <Badge variant="secondary" className="rounded-full bg-sky-100 text-sky-900">
              可继续提交
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full bg-slate-200 text-slate-700">
              当前不可重做
            </Badge>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{zh(assignment.description)}</p>

      <AssignmentRuleBadges assignment={assignment} />
      <AssignmentSubmissionEditor
        assignment={assignment}
        currentDraft={currentDraft}
        draftAttachments={draftAttachments}
        onDraftChange={onDraftChange}
        onAttachmentSelect={onAttachmentSelect}
        onAttachmentClear={onAttachmentClear}
      />
      <AssignmentFeedbackPanel assignment={assignment} />
      <AssignmentRubricScores assignment={assignment} />
      <AssignmentTeacherAnnotations assignment={assignment} />
      <AssignmentHistoryPanel assignment={assignment} />
      <AssignmentLatestReviewDelta assignment={assignment} />

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <Button
          className="rounded-lg bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white"
          onClick={() => void onSubmit(assignment.id, currentDraft, draftAttachments)}
          disabled={submittingKey === `assignment:${assignment.id}` || !assignment.canResubmit}
        >
          {submittingKey === `assignment:${assignment.id}` ? '提交中...' : submitLabel}
        </Button>
      </div>
    </div>
  )
}
