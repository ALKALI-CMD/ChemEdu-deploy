import { useEffect, useMemo, useState } from 'react'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import AssignmentDetailHighlight from './components/AssignmentDetailHighlight'
import AssignmentFilters, { type AssignmentFilterKey } from './components/AssignmentFilters'
import AssignmentSubmissionDetail from './components/AssignmentSubmissionDetail'
import AssignmentSummaryLink from './components/AssignmentSummaryLink'

type AssignmentPanelProps = {
  assignments: Assignment[]
  focusAssignmentId?: string
  assignmentDrafts: Record<string, string>
  attachmentDrafts: Record<string, AssignmentAttachment[]>
  submittingKey: string | null
  onDraftChange: (assignmentId: string, value: string) => void
  onAttachmentSelect: (assignmentId: string, files: FileList | null) => Promise<void>
  onAttachmentClear: (assignmentId: string) => void
  onSubmit: (assignmentId: string, draftValue: string, attachments: AssignmentAttachment[]) => Promise<void>
}

function filterAssignments(assignments: AssignmentPanelProps['assignments'], filter: AssignmentFilterKey) {
  switch (filter) {
    case 'pending':
      return assignments.filter((item) => item.submissionStatus === SubmissionStatus.Pending)
    case 'submitted':
      return assignments.filter((item) => item.submissionStatus === SubmissionStatus.Submitted)
    case 'reviewed':
      return assignments.filter((item) => item.submissionStatus === SubmissionStatus.Reviewed)
    default:
      return assignments
  }
}

export default function AssignmentPanel(props: AssignmentPanelProps) {
  const {
    assignments,
    focusAssignmentId,
    assignmentDrafts,
    attachmentDrafts,
    submittingKey,
    onDraftChange,
    onAttachmentSelect,
    onAttachmentClear,
    onSubmit,
  } = props

  const [filter, setFilter] = useState<AssignmentFilterKey>('all')

  useEffect(() => {
    if (!focusAssignmentId) {
      return
    }

    const timer = window.setTimeout(() => {
      document.getElementById(`assignment-${focusAssignmentId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [focusAssignmentId])

  const filteredAssignments = useMemo(() => filterAssignments(assignments, filter), [assignments, filter])
  const focusAssignment = assignments.find((item) => item.id === focusAssignmentId)
  const selectedAssignment = focusAssignmentId ? assignments.find((item) => item.id === focusAssignmentId) : undefined

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-4">
        <CardTitle className="text-slate-950">作业提交</CardTitle>
        <AssignmentFilters assignments={assignments} value={filter} onChange={setFilter} />
      </CardHeader>
      <CardContent className="space-y-4">
        <AssignmentDetailHighlight assignment={focusAssignment} />

        {filteredAssignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            暂无作业。
          </div>
        ) : null}

        {filteredAssignments.length > 0 ? (
          <div className="grid gap-4">
            {!focusAssignmentId ? (
              <div className="space-y-3">
                {filteredAssignments.map((assignment) => (
                  <AssignmentSummaryLink key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : null}

            {selectedAssignment ? (
              <AssignmentSubmissionDetail
                assignment={selectedAssignment}
                focusAssignmentId={focusAssignmentId}
                currentDraft={assignmentDrafts[selectedAssignment.id] ?? selectedAssignment.submissionContent ?? ''}
                draftAttachments={attachmentDrafts[selectedAssignment.id] ?? []}
                submittingKey={submittingKey}
                onDraftChange={onDraftChange}
                onAttachmentSelect={onAttachmentSelect}
                onAttachmentClear={onAttachmentClear}
                onSubmit={onSubmit}
              />
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
