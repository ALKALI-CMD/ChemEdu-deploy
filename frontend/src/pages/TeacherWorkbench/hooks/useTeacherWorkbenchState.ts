import { useState } from 'react'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'

export function useTeacherWorkbenchState() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [courseFormMode, setCourseFormMode] = useState<'edit' | 'create'>('edit')
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({})
  const [rubricScoreDrafts, setRubricScoreDrafts] = useState<Record<string, Record<string, string>>>({})
  const [rubricCommentDrafts, setRubricCommentDrafts] = useState<Record<string, Record<string, string>>>({})
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [annotationDrafts, setAnnotationDrafts] = useState<Record<string, string>>({})
  const [reviewAttachmentDrafts, setReviewAttachmentDrafts] = useState<Record<string, AssignmentAttachment[]>>({})
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null)
  const [publishingLearningTask, setPublishingLearningTask] = useState(false)

  return {
    selectedCourseId,
    setSelectedCourseId,
    selectedCourseIds,
    setSelectedCourseIds,
    courseFormMode,
    setCourseFormMode,
    scoreDrafts,
    setScoreDrafts,
    rubricScoreDrafts,
    setRubricScoreDrafts,
    rubricCommentDrafts,
    setRubricCommentDrafts,
    feedbackDrafts,
    setFeedbackDrafts,
    annotationDrafts,
    setAnnotationDrafts,
    reviewAttachmentDrafts,
    setReviewAttachmentDrafts,
    submittingAssignmentId,
    setSubmittingAssignmentId,
    publishingLearningTask,
    setPublishingLearningTask,
  }
}
