// 文件说明：定义课程讨论创建平台举报领域数据类型，用于业务流程和接口传输。

export type CreatePlatformReportData = {
  targetType: string
  targetId: string
  targetLabel: string
  reason: string
  detail?: string
}
