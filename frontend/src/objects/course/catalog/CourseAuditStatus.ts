// 文件说明：定义课程目录课程审核状态领域数据类型，用于业务流程和接口传输。
export const CourseAuditStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const

export type CourseAuditStatus = typeof CourseAuditStatus[keyof typeof CourseAuditStatus]
