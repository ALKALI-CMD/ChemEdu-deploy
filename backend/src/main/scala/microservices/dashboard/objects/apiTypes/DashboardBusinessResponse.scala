// 文件说明：定义看板看板经营接口响应类型，用于前后端 API 返回值约束。
package microservices.dashboard.objects.apiTypes

import microservices.dashboard.objects.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.objects.{BusinessDashboardSnapshot, Coupon, Invoice, Order, Promotion, Refund}
import microservices.course.catalog.objects.ResourceAsset
import microservices.course.discussion.objects.MessageThread

final case class DashboardBusinessResponse(
  messages: List[MessageThread],
  orders: List[Order],
  coupons: List[Coupon],
  promotions: List[Promotion],
  invoices: List[Invoice],
  refunds: List[Refund],
  resourceAssets: List[ResourceAsset],
  businessDashboard: BusinessDashboardSnapshot
)

object DashboardBusinessResponse:
  given Encoder[DashboardBusinessResponse] = deriveEncoder[DashboardBusinessResponse]
  given Decoder[DashboardBusinessResponse] = deriveDecoder[DashboardBusinessResponse]
