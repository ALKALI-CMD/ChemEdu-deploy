// 文件说明：定义管理端发票领域数据类型，用于业务流程和接口传输。

export type Invoice = {
  id: string
  orderId: string
  title: string
  amount: number
  status: string
  issuedAt?: string
}
