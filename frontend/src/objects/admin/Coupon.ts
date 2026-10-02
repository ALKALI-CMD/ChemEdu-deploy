// 文件说明：定义管理端Coupon领域数据类型，用于业务流程和接口传输。

export type Coupon = {
  id: string
  code: string
  title: string
  discountAmount: number
  minAmount: number
  validFrom: string
  validTo: string
  active: boolean
}
