// 文件说明：定义课程讨论通知Item领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class NotificationItem(
  id: String,
  userId: String,
  courseId: Option[String],
  category: String,
  title: String,
  content: String,
  read: Boolean,
  createdAt: String,
  actionUrl: Option[String]
)

object NotificationItem:
  given Encoder[NotificationItem] = deriveEncoder[NotificationItem]
  given Decoder[NotificationItem] = deriveDecoder[NotificationItem]
