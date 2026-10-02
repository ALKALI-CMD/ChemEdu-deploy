import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import { Badge, Button, Textarea } from '@/components/ui/UiComponents'
import AssignmentReviewAttachmentEditor from './AssignmentReviewAttachmentEditor'
import AssignmentReviewHistory from './AssignmentReviewHistory'
import AssignmentRubricReviewEditor from './AssignmentRubricReviewEditor'
import AssignmentSubmissionSummary from './AssignmentSubmissionSummary'
import {
  feedbackTemplates,
  reviewableStatusLabel,
  text,
} from '../functions/teacherReviewUtils'

type AssignmentReviewCardProps = {
  assignment: Assignment
  courseTitle: string
  scoreDraft: string
  rubricScoreDraft: Record<string, string>
  rubricCommentDraft: Record<string, string>
  feedbackDraft: string
  annotationDraft: string
  reviewDraftAttachments: AssignmentAttachment[]
  submittingAssignmentId: string | null
  onScoreChange: (assignmentId: string, value: string) => void
  onRubricScoreChange: (assignmentId: string, criterionId: string, value: string) => void
  onRubricCommentChange: (assignmentId: string, criterionId: string, value: string) => void
  onFeedbackChange: (assignmentId: string, value: string) => void
  onAnnotationChange: (assignmentId: string, value: string) => void
  onAttachmentSelect: (assignmentId: string, files: FileList | null) => Promise<void>
  onAttachmentClear: (assignmentId: string) => void
  onSubmit: (assignmentId: string, attachments: AssignmentAttachment[]) => Promise<void>
}

export default function AssignmentReviewCard({
  assignment,
  courseTitle,
  scoreDraft,
  rubricScoreDraft,
  rubricCommentDraft,
  feedbackDraft,
  annotationDraft,
  reviewDraftAttachments,
  submittingAssignmentId,
  onScoreChange,
  onRubricScoreChange,
  onRubricCommentChange,
  onFeedbackChange,
  onAnnotationChange,
  onAttachmentSelect,
  onAttachmentClear,
  onSubmit,
}: AssignmentReviewCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950">{text(assignment.title)}</p>
          <p className="text-sm text-slate-500">
            {courseTitle} / 状态：{reviewableStatusLabel[assignment.submissionStatus]}
            {assignment.submittedAt ? ` / 提交时间：${assignment.submittedAt}` : ''}
            {assignment.reviewedAt ? ` / 最近批改：${assignment.reviewedAt}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {assignment.lateSubmitted ? (
            <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-900">
              已迟交
            </Badge>
          ) : null}
          <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
            {assignment.score !== undefined ? `当前 ${assignment.score} 分` : '待评分'}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <AssignmentSubmissionSummary assignment={assignment} />

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">批改结果</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {feedbackTemplates.map((template) => (
                <Button
                  key={template}
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => onFeedbackChange(assignment.id, feedbackDraft ? `${feedbackDraft}\n${template}` : template)}
                >
                  反馈模板
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            <AssignmentRubricReviewEditor
              assignment={assignment}
              scoreDraft={scoreDraft}
              rubricScoreDraft={rubricScoreDraft}
              rubricCommentDraft={rubricCommentDraft}
              onScoreChange={onScoreChange}
              onRubricScoreChange={onRubricScoreChange}
              onRubricCommentChange={onRubricCommentChange}
            />

            <Textarea
              className="min-h-24 bg-white"
              placeholder="填写本次作业的整体反馈、修改建议或批改结论"
              value={feedbackDraft}
              onChange={(event) => onFeedbackChange(assignment.id, event.target.value)}
            />
            <Textarea
              className="min-h-20 bg-white"
              placeholder="教师批注"
              value={annotationDraft}
              onChange={(event) => onAnnotationChange(assignment.id, event.target.value)}
            />

            <AssignmentReviewAttachmentEditor
              assignment={assignment}
              reviewDraftAttachments={reviewDraftAttachments}
              onAttachmentSelect={onAttachmentSelect}
              onAttachmentClear={onAttachmentClear}
            />

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {assignment.reviewerName ? `最近批改教师：${text(assignment.reviewerName)}` : '尚未批改'}
              </p>
              <Button
                className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                onClick={() => void onSubmit(assignment.id, reviewDraftAttachments)}
                disabled={submittingAssignmentId === assignment.id}
              >
                {submittingAssignmentId === assignment.id ? '提交中...' : '提交批改'}
              </Button>
            </div>

            <AssignmentReviewHistory assignment={assignment} />
          </div>
        </div>
      </div>
    </div>
  )
}
