// 文件说明：定义课程讨论通知设置领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class NotificationSetting(
  userId: String,
  category: String,
  enabled: Boolean
)

object NotificationSetting:
  given Encoder[NotificationSetting] = deriveEncoder[NotificationSetting]
  given Decoder[NotificationSetting] = deriveDecoder[NotificationSetting]
