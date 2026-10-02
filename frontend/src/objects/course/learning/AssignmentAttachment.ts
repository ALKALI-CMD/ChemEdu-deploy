// 文件说明：定义学习作业附件领域数据类型，用于业务流程和接口传输。
import type { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'

export type AssignmentAttachment = {
  label: string
  url: string
  attachmentType: AssignmentAttachmentType
  sizeBytes?: number
  uploadedAt?: string
}
