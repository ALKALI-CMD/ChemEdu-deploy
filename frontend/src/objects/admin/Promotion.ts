// 文件说明：定义管理端Promotion领域数据类型，用于业务流程和接口传输。

export type Promotion = {
  id: string
  title: string
  description: string
  discountPercent: number
  startsAt: string
  endsAt: string
  active: boolean
}
