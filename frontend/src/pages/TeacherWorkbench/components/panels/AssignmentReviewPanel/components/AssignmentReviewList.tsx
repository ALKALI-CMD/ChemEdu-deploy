import { Link } from 'react-router-dom'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import { Badge, Button } from '@/components/ui/UiComponents'
import AssignmentReviewCard from './AssignmentReviewCard'
import { reviewableStatusLabel } from '../functions/teacherReviewUtils'

type AssignmentReviewListProps = {
  assignments: Assignment[]
  detailAssignmentId?: string
  selectedAssignmentId: string | null
  onSelectAssignment: (assignmentId: string) => void
  courseTitleMap: Map<string, string>
  scoreDrafts: Record<string, string>
  rubricScoreDrafts: Record<string, Record<string, string>>
  rubricCommentDrafts: Record<string, Record<string, string>>
  feedbackDrafts: Record<string, string>
  annotationDrafts: Record<string, string>
  reviewAttachmentDrafts: Record<string, AssignmentAttachment[]>
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

export default function AssignmentReviewList({
  assignments,
  detailAssignmentId,
  selectedAssignmentId,
  onSelectAssignment,
  courseTitleMap,
  scoreDrafts,
  rubricScoreDrafts,
  rubricCommentDrafts,
  feedbackDrafts,
  annotationDrafts,
  reviewAttachmentDrafts,
  submittingAssignmentId,
  onScoreChange,
  onRubricScoreChange,
  onRubricCommentChange,
  onFeedbackChange,
  onAnnotationChange,
  onAttachmentSelect,
  onAttachmentClear,
  onSubmit,
}: AssignmentReviewListProps) {
  void onSelectAssignment
  const selectedAssignment = detailAssignmentId
    ? assignments.find((assignment) => assignment.id === detailAssignmentId) ?? null
    : assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? assignments[0] ?? null

  if (!selectedAssignment) {
    return null
  }

  return (
    <div className="grid gap-4">
      {!detailAssignmentId ? (
      <div className="space-y-3">
        {assignments.map((assignment) => {
          const selected = assignment.id === selectedAssignment.id
          const courseTitle = courseTitleMap.get(assignment.courseId) ?? '未知课程'

          return (
            <Link
              key={assignment.id}
              to={`/teacher/reviews/${assignment.id}`}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected ? 'block border-sky-300 bg-sky-50 shadow-sm' : 'block border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{String(assignment.title)}</p>
                  <p className="mt-1 text-sm text-slate-500">{courseTitle}</p>
                </div>
                <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
                  {reviewableStatusLabel[assignment.submissionStatus]}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <span>提交：{assignment.submittedAt ?? '未提交'}</span>
                <span>分数：{assignment.score ?? '待评分'}</span>
                <span>次数：{assignment.attemptCount} / {assignment.maxAttempts}</span>
                <span>{assignment.lateSubmitted ? '已迟交' : '未迟交'}</span>
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="outline" className="h-8 rounded-full px-3">
                  查看详情
                </Button>
              </div>
            </Link>
          )
        })}
      </div>
      ) : null}

      {detailAssignmentId ? (
      <div>
        <AssignmentReviewCard
          assignment={selectedAssignment}
          courseTitle={courseTitleMap.get(selectedAssignment.courseId) ?? '未知课程'}
          scoreDraft={scoreDrafts[selectedAssignment.id] ?? String(selectedAssignment.score ?? '')}
          rubricScoreDraft={rubricScoreDrafts[selectedAssignment.id] ?? {}}
          rubricCommentDraft={rubricCommentDrafts[selectedAssignment.id] ?? {}}
          feedbackDraft={feedbackDrafts[selectedAssignment.id] ?? selectedAssignment.feedback ?? ''}
          annotationDraft={annotationDrafts[selectedAssignment.id] ?? ''}
          reviewDraftAttachments={reviewAttachmentDrafts[selectedAssignment.id] ?? []}
          submittingAssignmentId={submittingAssignmentId}
          onScoreChange={onScoreChange}
          onRubricScoreChange={onRubricScoreChange}
          onRubricCommentChange={onRubricCommentChange}
          onFeedbackChange={onFeedbackChange}
          onAnnotationChange={onAnnotationChange}
          onAttachmentSelect={onAttachmentSelect}
          onAttachmentClear={onAttachmentClear}
          onSubmit={onSubmit}
        />
      </div>
      ) : null}
    </div>
  )
}
