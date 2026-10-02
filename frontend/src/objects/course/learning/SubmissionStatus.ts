// 文件说明：定义学习Submission状态领域数据类型，用于业务流程和接口传输。
export const SubmissionStatus = {
  Pending: 'pending',
  Submitted: 'submitted',
  Reviewed: 'reviewed',
} as const

export type SubmissionStatus = typeof SubmissionStatus[keyof typeof SubmissionStatus]
