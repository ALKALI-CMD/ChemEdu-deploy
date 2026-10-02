// 文件说明：定义学习提交作业领域数据类型，用于业务流程和接口传输。
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'

export type SubmitAssignmentInput = {
  assignmentId: string
  submissionContent: string
  submissionAttachments: AssignmentAttachment[]
  submissionNote?: string
}
