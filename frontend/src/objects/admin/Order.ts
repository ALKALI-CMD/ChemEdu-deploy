// 文件说明：定义管理端订单领域数据类型，用于业务流程和接口传输。

export type Order = {
  id: string
  buyer: string
  courseTitle: string
  amount: number
  status: string
  paidAt: string
  originalAmount: number
  discountAmount: number
  paymentState: string
  paymentMethod?: string
  couponCode?: string
  refundStatus?: string
  refundAmount: number
  invoiceStatus?: string
  invoiceTitle?: string
  promotionId?: string
  billingCycle?: string
}
