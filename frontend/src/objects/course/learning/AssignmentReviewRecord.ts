// 文件说明：定义学习作业评价/批改Record领域数据类型，用于业务流程和接口传输。
import type { AssignmentRubricScore } from '@/objects/course/learning/AssignmentRubricScore'
import type { TeacherAnnotation } from '@/objects/course/learning/TeacherAnnotation'

export type AssignmentReviewRecord = {
  reviewNumber: number
  rawScore: number
  finalScore: number
  latePenaltyAppliedPercent: number
  latePenaltyAppliedPoints: number
  feedback: string
  reviewerName: string | string
  reviewedAt: string
  rubricScores: AssignmentRubricScore[]
  teacherAnnotations: TeacherAnnotation[]
}
