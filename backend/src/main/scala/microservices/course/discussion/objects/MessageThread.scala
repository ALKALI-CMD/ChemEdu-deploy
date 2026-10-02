// 文件说明：定义课程讨论消息Thread领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class MessageThread(
  id: String,
  from: String,
  to: String,
  content: String,
  attachmentLabel: Option[String],
  sentAt: String,
  read: Boolean,
  category: String,
  courseId: Option[String]
)

object MessageThread:
  given Encoder[MessageThread] = deriveEncoder[MessageThread]
  given Decoder[MessageThread] = deriveDecoder[MessageThread]
