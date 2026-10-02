// 文件说明：定义管理端管理端CommonTypes领域数据类型，用于业务流程和接口传输。
package microservices.admin.objects

import io.circe.{Decoder, Encoder}

enum OrderStatus(val entryName: String):
  case Paid extends OrderStatus("paid")
  case Pending extends OrderStatus("pending")
  case Refunded extends OrderStatus("refunded")

object OrderStatus:
  def toString(value: OrderStatus): String =
    value.entryName

  def fromString(value: String): Option[OrderStatus] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[OrderStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[OrderStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown OrderStatus: $value")
  )
