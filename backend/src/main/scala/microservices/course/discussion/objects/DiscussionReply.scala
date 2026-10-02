// 文件说明：定义课程讨论讨论Reply领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class DiscussionReply(
  id: String,
  topicId: String,
  authorId: String,
  author: String,
  authorRole: UserRole,
  content: String,
  createdAt: String,
  updatedAt: Option[String],
  visibility: DiscussionVisibility,
  moderatedBy: Option[String],
  moderatedAt: Option[String],
  moderationNote: Option[String]
)

object DiscussionReply:
  given Encoder[DiscussionReply] = deriveEncoder[DiscussionReply]
  given Decoder[DiscussionReply] = deriveDecoder[DiscussionReply]
