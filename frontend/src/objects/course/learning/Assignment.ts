// 文件说明：定义学习作业领域数据类型，用于业务流程和接口传输。
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentReviewRecord } from '@/objects/course/learning/AssignmentReviewRecord'
import type { AssignmentRubricCriterion } from '@/objects/course/learning/AssignmentRubricCriterion'
import type { AssignmentRubricScore } from '@/objects/course/learning/AssignmentRubricScore'
import type { AssignmentSubmissionRecord } from '@/objects/course/learning/AssignmentSubmissionRecord'
import type { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { TeacherAnnotation } from '@/objects/course/learning/TeacherAnnotation'

export type Assignment = {
  id: string
  courseId: string
  title: string
  description: string
  deadline: string
  attachmentLabel: string
  referenceAttachments: AssignmentAttachment[]
  submissionStatus: SubmissionStatus
  score?: number
  rawScore?: number
  submissionContent?: string
  submissionNote?: string
  submissionAttachments: AssignmentAttachment[]
  submittedAt?: string
  feedback?: string
  reviewAttachments: AssignmentAttachment[]
  reviewerName?: string
  reviewedAt?: string
  attemptCount: number
  resubmissionCount: number
  maxAttempts: number
  allowLateSubmission: boolean
  allowResubmission: boolean
  allowMakeUpSubmission: boolean
  lateSubmissionDeadline?: string
  latePenaltyPercentPerDay: number
  latePenaltyCapPercent: number
  latePenaltyAppliedPercent: number
  lateSubmitted: boolean
  reviewCount: number
  canResubmit: boolean
  rubric: AssignmentRubricCriterion[]
  rubricScores: AssignmentRubricScore[]
  teacherAnnotations: TeacherAnnotation[]
  submissionHistory: AssignmentSubmissionRecord[]
  reviewHistory: AssignmentReviewRecord[]
}
