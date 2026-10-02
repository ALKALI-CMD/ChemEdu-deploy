// 文件说明：定义课程讨论讨论教师Highlight领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class DiscussionTeacherHighlight(
  id: String,
  author: String,
  authorRole: UserRole,
  content: String,
  createdAt: String,
  sourceType: String
)

object DiscussionTeacherHighlight:
  given Encoder[DiscussionTeacherHighlight] = deriveEncoder[DiscussionTeacherHighlight]
  given Decoder[DiscussionTeacherHighlight] = deriveDecoder[DiscussionTeacherHighlight]

