// 文件说明：定义管理端观测Snapshot领域数据类型，用于业务流程和接口传输。

export type ObservabilitySnapshot = {
  errorLogEnabled: boolean
  performanceMonitoringEnabled: boolean
  apiLatencyP95Ms: number
  criticalTraceCount: number
  lastIncidentAt?: string
  metrics: string[]
}
