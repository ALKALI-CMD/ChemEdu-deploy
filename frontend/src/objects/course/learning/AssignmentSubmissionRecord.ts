// 文件说明：定义学习作业SubmissionRecord领域数据类型，用于业务流程和接口传输。

export type AssignmentSubmissionRecord = {
  attemptNumber: number
  submittedAt: string
  lateSubmitted: boolean
  submissionContentPreview?: string
  attachmentCount: number
  submissionNote?: string
}
