// 文件说明：定义管理端Refund领域数据类型，用于业务流程和接口传输。

export type Refund = {
  id: string
  orderId: string
  amount: number
  reason: string
  status: string
  requestedAt: string
  processedAt?: string
}
