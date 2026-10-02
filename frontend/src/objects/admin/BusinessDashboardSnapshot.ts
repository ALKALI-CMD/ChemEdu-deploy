// 文件说明：定义管理端经营看板Snapshot领域数据类型，用于业务流程和接口传输。

export type BusinessDashboardSnapshot = {
  courseConversionRate: string
  enrollmentCount: number
  activeLearnerCount: number
  taskCompletionRate: string
  discussionActivityScore: number
  revenue: number
  refundAmount: number
  couponUsageCount: number
  invoicePendingCount: number
}
