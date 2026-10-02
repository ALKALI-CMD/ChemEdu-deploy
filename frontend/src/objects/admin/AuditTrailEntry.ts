// 文件说明：定义管理端审核审计轨迹Entry领域数据类型，用于业务流程和接口传输。

export type AuditTrailEntry = {
  id: string
  actorName: string | string
  action: string
  targetType: string
  targetId: string
  detail: string
  createdAt: string
  traceId: string
}
