// 文件说明：定义学习评价/批改作业领域数据类型，用于业务流程和接口传输。
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentRubricScore } from '@/objects/course/learning/AssignmentRubricScore'
import type { TeacherAnnotation } from '@/objects/course/learning/TeacherAnnotation'

export type ReviewAssignmentInput = {
  assignmentId: string
  score: number
  feedback: string
  reviewAttachments: AssignmentAttachment[]
  rubricScores: AssignmentRubricScore[]
  teacherAnnotations: TeacherAnnotation[]
}
