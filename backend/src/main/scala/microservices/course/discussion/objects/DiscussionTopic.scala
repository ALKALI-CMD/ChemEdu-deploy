// 文件说明：定义课程讨论讨论Topic领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class DiscussionTopic(
  id: String,
  courseId: String,
  authorId: String,
  title: String,
  author: String,
  authorRole: UserRole,
  content: String,
  replyCount: Int,
  createdAt: String,
  updatedAt: Option[String],
  lastReplyAt: String,
  lessonId: Option[String],
  lessonTitle: Option[String],
  resolved: Boolean,
  resolvedBy: Option[String],
  resolvedAt: Option[String],
  visibility: DiscussionVisibility,
  threadState: DiscussionThreadState,
  pinState: DiscussionPinState,
  moderatedBy: Option[String],
  moderatedAt: Option[String],
  moderationNote: Option[String],
  teacherHighlights: List[DiscussionTeacherHighlight],
  heatScore: Int,
  likeCount: Int,
  favoriteCount: Int,
  reportCount: Int,
  mentionUserIds: List[String],
  sensitiveHitCount: Int,
  likedByCurrentUser: Boolean,
  favoritedByCurrentUser: Boolean,
  reportedByCurrentUser: Boolean,
  replies: List[DiscussionReply]
)

object DiscussionTopic:
  given Encoder[DiscussionTopic] = deriveEncoder[DiscussionTopic]
  given Decoder[DiscussionTopic] = deriveDecoder[DiscussionTopic]

