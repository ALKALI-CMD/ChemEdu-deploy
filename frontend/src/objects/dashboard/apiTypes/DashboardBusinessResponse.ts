// 文件说明：定义看板看板经营接口响应类型，用于前后端 API 返回值约束。
import type { BusinessDashboardSnapshot } from '@/objects/admin/BusinessDashboardSnapshot'
import type { Coupon } from '@/objects/admin/Coupon'
import type { Invoice } from '@/objects/admin/Invoice'
import type { Order } from '@/objects/admin/Order'
import type { Promotion } from '@/objects/admin/Promotion'
import type { Refund } from '@/objects/admin/Refund'
import type { ResourceAsset } from '@/objects/course/catalog/ResourceAsset'
import type { MessageThread } from '@/objects/course/discussion/MessageThread'

export type DashboardBusinessResponse = {
  messages: MessageThread[]
  orders: Order[]
  coupons: Coupon[]
  promotions: Promotion[]
  invoices: Invoice[]
  refunds: Refund[]
  resourceAssets: ResourceAsset[]
  businessDashboard: BusinessDashboardSnapshot
}
