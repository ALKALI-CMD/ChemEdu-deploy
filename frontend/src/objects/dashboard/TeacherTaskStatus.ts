// 文件说明：定义看板教师Task状态领域数据类型，用于业务流程和接口传输。
export const TeacherTaskStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Completed: 'completed',
} as const

export type TeacherTaskStatus = typeof TeacherTaskStatus[keyof typeof TeacherTaskStatus]
