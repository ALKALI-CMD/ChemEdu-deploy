import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import AssignmentReviewHeader from './components/AssignmentReviewHeader'
import AssignmentReviewList from './components/AssignmentReviewList'
import { useAssignmentReviewFilters } from './hooks/useAssignmentReviewFilters'

type AssignmentReviewPanelProps = {
  courses: Course[]
  assignments: Assignment[]
  detailAssignmentId?: string
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
  onExportAll: (assignments: Assignment[]) => void
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export default function AssignmentReviewPanel({
  courses,
  assignments,
  detailAssignmentId,
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
  onExportAll,
}: AssignmentReviewPanelProps) {
  const { courseFilter, setCourseFilter, statusFilter, setStatusFilter, filteredAssignments } = useAssignmentReviewFilters(assignments)
  const courseTitleMap = useMemo(() => new Map(courses.map((course) => [course.id, text(course.title)])), [courses])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(detailAssignmentId ?? null)
  const lateCount = filteredAssignments.filter((assignment) => assignment.lateSubmitted).length
  const resubmittableCount = filteredAssignments.filter((assignment) => assignment.canResubmit).length

  useEffect(() => {
    if (filteredAssignments.length === 0) {
      setSelectedAssignmentId(null)
      return
    }
    if (detailAssignmentId) {
      setSelectedAssignmentId(detailAssignmentId)
      return
    }
    if (!selectedAssignmentId || !filteredAssignments.some((assignment) => assignment.id === selectedAssignmentId)) {
      setSelectedAssignmentId(filteredAssignments[0].id)
    }
  }, [detailAssignmentId, filteredAssignments, selectedAssignmentId])

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-4">
        <AssignmentReviewHeader
          courses={courses}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">当前提交 {filteredAssignments.length}</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">迟交 {lateCount}</span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900">可重做 {resubmittableCount}</span>
          </div>
          <button
            type="button"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => onExportAll(filteredAssignments)}
          >
            批量下载提交物
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            当前筛选条件下没有可查看的学生作业提交。
          </div>
        ) : null}

        <AssignmentReviewList
          assignments={filteredAssignments}
          detailAssignmentId={detailAssignmentId}
          selectedAssignmentId={selectedAssignmentId}
          onSelectAssignment={setSelectedAssignmentId}
          courseTitleMap={courseTitleMap}
          scoreDrafts={scoreDrafts}
          rubricScoreDrafts={rubricScoreDrafts}
          rubricCommentDrafts={rubricCommentDrafts}
          feedbackDrafts={feedbackDrafts}
          annotationDrafts={annotationDrafts}
          reviewAttachmentDrafts={reviewAttachmentDrafts}
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
      </CardContent>
    </Card>
  )
}
