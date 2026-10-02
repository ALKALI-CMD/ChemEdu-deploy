// 文件说明：定义管理端订单领域数据类型，用于业务流程和接口传输。
package microservices.admin.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.admin.objects.*
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*

final case class Order(
  id: String,
  buyer: String,
  courseTitle: String,
  amount: Int,
  status: OrderStatus,
  paidAt: String,
  originalAmount: Int,
  discountAmount: Int,
  paymentState: String,
  paymentMethod: Option[String],
  couponCode: Option[String],
  refundStatus: Option[String],
  refundAmount: Int,
  invoiceStatus: Option[String],
  invoiceTitle: Option[String],
  promotionId: Option[String],
  billingCycle: Option[String]
)

object Order:
  given Encoder[Order] = deriveEncoder[Order]
  given Decoder[Order] = deriveDecoder[Order]
