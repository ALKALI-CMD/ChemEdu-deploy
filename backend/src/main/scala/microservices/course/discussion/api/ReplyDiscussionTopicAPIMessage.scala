// 文件说明：后端课程讨论接口实现，用于处理Reply讨论Topic请求并返回类型安全响应。
package microservices.course.discussion.api


import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserProfile
import microservices.course.catalog.objects.apiTypes.MessageResponse
import microservices.course.discussion.api.ListDiscussionsAPIMessage
import microservices.course.discussion.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.discussion.objects.{DiscussionPinState, DiscussionThreadState, DiscussionVisibility}
import microservices.course.discussion.tables.DiscussionTable

import java.sql.Connection
import java.time.Instant

final case class ReplyDiscussionTopicAPIMessage(
  sessionToken: String,
  topicId: Option[String],
  content: String
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    ReplyDiscussionTopicAPIMessage.schema.execute(this, connection)



object ReplyDiscussionTopicAPIMessage:
  val inputDecoder: Decoder[ReplyDiscussionTopicAPIMessage] = deriveDecoder[ReplyDiscussionTopicAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[ReplyDiscussionTopicAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "ReplyDiscussionTopicAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedTopicId <- IO.fromOption(input.topicId)(
              new IllegalArgumentException("input.topicId is required for ReplyDiscussionTopicAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ReplyDiscussionTopicAPIMessage.replyDiscussionTopicForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              ReplyDiscussionTopicData(
                topicId = resolvedTopicId,
                content = input.content
              )
            )
          yield response
  )
  given Decoder[ReplyDiscussionTopicAPIMessage] = inputDecoder
  given Encoder[ReplyDiscussionTopicAPIMessage] = deriveEncoder[ReplyDiscussionTopicAPIMessage]

  private[discussion] def replyDiscussionTopicForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: ReplyDiscussionTopicData
  ): IO[DiscussionTopicMutationResponse] =
    val trimmedContent = request.content.trim
    for
      topic <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
      _ <-
        if trimmedContent.nonEmpty then IO.unit
        else IO.raiseError(new IllegalArgumentException("Discussion reply cannot be empty."))
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionParticipant(table, connection, currentUser, topic.courseId)
      _ <- ListDiscussionsAPIMessage.ensureDiscussionReplyAllowed(table, connection, currentUser, topic)
      replyId = ListDiscussionsAPIMessage.generateId("reply")
      now = Instant.now().toString
      mentionUserIds <- ListDiscussionsAPIMessage.resolveMentionUserIds(table, connection, trimmedContent)
      sensitiveHitCount = ListDiscussionsAPIMessage.countSensitiveHits(trimmedContent)
      _ <- DiscussionTable.insertDiscussionReply(connection, replyId, request.topicId, currentUser.id, currentUser.name, trimmedContent, now)
      _ <- ListDiscussionsAPIMessage.refreshDiscussionReplyStats(table, connection, request.topicId)
      _ <- ListDiscussionsAPIMessage.mergeTopicModerationSignals(table, connection, request.topicId, mentionUserIds, sensitiveHitCount)
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
    yield DiscussionTopicMutationResponse("Discussion reply posted.", updated)
