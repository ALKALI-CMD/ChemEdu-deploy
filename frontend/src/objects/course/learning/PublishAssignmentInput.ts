// 文件说明：定义学习发布作业领域数据类型，用于业务流程和接口传输。
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentRubricCriterion } from '@/objects/course/learning/AssignmentRubricCriterion'

export type PublishAssignmentInput = {
  courseId: string
  title: string
  description: string
  deadline: string
  attachmentLabel: string
  maxAttempts?: number
  allowLateSubmission?: boolean
  allowResubmission?: boolean
  allowMakeUpSubmission?: boolean
  lateSubmissionDeadline?: string
  latePenaltyPercentPerDay?: number
  latePenaltyCapPercent?: number
  rubric: AssignmentRubricCriterion[]
  referenceAttachments: AssignmentAttachment[]
}
