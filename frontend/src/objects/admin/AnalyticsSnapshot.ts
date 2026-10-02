// 文件说明：定义管理端分析Snapshot领域数据类型，用于业务流程和接口传输。

export type AnalyticsSnapshot = {
  registeredUsers: number
  paidConversionRate: string
  totalRevenue: number
  averageAssignmentScore: number
  quizPassRate: string
  weeklyLearningHours: number
  gradebookAverage: number
  completedTaskRate: string
}
