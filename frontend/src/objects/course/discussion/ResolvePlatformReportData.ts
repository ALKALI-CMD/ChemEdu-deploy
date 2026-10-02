// 文件说明：定义课程讨论解析平台举报领域数据类型，用于业务流程和接口传输。

export type ResolvePlatformReportData = {
  reportId: string
  status: string
  resolutionNote?: string
}
