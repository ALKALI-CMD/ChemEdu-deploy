// 文件说明：定义学习作业附件类型领域数据类型，用于业务流程和接口传输。
export const AssignmentAttachmentType = {
  Reference: 'reference',
  Submission: 'submission',
  Review: 'review',
} as const

export type AssignmentAttachmentType = typeof AssignmentAttachmentType[keyof typeof AssignmentAttachmentType]
