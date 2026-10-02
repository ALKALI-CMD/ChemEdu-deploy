// 文件说明：定义课程讨论讨论RowModels领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import microservices.course.discussion.objects.*
import microservices.auth.objects.*

private[discussion] final case class DiscussionTopicRow(
  id: String,
  courseId: String,
  title: String,
  authorId: String,
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
  likeCount: Int,
  favoriteCount: Int,
  reportCount: Int,
  mentionUserIds: List[String],
  sensitiveHitCount: Int,
  likedByCurrentUser: Boolean,
  favoritedByCurrentUser: Boolean,
  reportedByCurrentUser: Boolean
)

private[discussion] final case class DiscussionReplyRow(
  id: String,
  topicId: String,
  courseId: String,
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

private[discussion] final case class DiscussionReactionStats(
  likeCount: Int,
  favoriteCount: Int,
  reportCount: Int,
  likedByCurrentUser: Boolean,
  favoritedByCurrentUser: Boolean,
  reportedByCurrentUser: Boolean
)
