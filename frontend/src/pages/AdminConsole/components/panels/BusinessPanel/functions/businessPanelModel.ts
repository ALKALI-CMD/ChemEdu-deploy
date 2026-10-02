import type { Course } from '@/objects/course/catalog/Course'
import type { PaymentMethod } from '@/lib/paymentMethods'
import { paymentMethodLabels, paymentMethods } from '@/lib/paymentMethods'

export const paymentStateLabel: Record<string, string> = {
  paid: '已支付',
  awaiting_payment: '待支付',
  refunded: '已退款',
  refunding: '退款中',
  failed: '失败',
}

export const invoiceStatusLabel: Record<string, string> = {
  issued: '已开票',
  pending: '待开票',
  not_requested: '未申请',
}

export function formatMoney(value: number) {
  return `￥${value.toLocaleString('zh-CN')}`
}

export function paymentMethodLabel(paymentMethod?: string) {
  return paymentMethods.includes(paymentMethod as PaymentMethod)
    ? paymentMethodLabels[paymentMethod as PaymentMethod]
    : paymentMethod ?? '无'
}

export function findBusinessCourse(courses: Course[], courseId: string) {
  return courses.find((course) => course.id === courseId)
}
