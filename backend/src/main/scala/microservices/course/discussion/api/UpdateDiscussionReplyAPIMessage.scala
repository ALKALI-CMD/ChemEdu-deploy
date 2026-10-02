// 文件说明：后端课程讨论接口实现，用于处理更新讨论Reply请求并返回类型安全响应。
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

final case class UpdateDiscussionReplyAPIMessage(
  sessionToken: String,
  replyId: Option[String],
  content: String
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    UpdateDiscussionReplyAPIMessage.schema.execute(this, connection)



object UpdateDiscussionReplyAPIMessage:
  val inputDecoder: Decoder[UpdateDiscussionReplyAPIMessage] = deriveDecoder[UpdateDiscussionReplyAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateDiscussionReplyAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateDiscussionReplyAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedReplyId <- IO.fromOption(input.replyId)(
              new IllegalArgumentException("input.replyId is required for UpdateDiscussionReplyAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- UpdateDiscussionReplyAPIMessage.updateDiscussionReplyForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              UpdateDiscussionReplyData(
                replyId = resolvedReplyId,
                content = input.content
              )
            )
          yield response
  )
  given Decoder[UpdateDiscussionReplyAPIMessage] = inputDecoder
  given Encoder[UpdateDiscussionReplyAPIMessage] = deriveEncoder[UpdateDiscussionReplyAPIMessage]

  private[discussion] def updateDiscussionReplyForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    request: UpdateDiscussionReplyData
  ): IO[DiscussionTopicMutationResponse] =
    val trimmedContent = request.content.trim
    for
      reply <- ListDiscussionsAPIMessage.requireDiscussionReply(table, connection, request.replyId)
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionAuthorOrModerator(table, connection, actor, reply.courseId, reply.authorId)
      _ <- ListDiscussionsAPIMessage.ensureNonEmpty(trimmedContent, "Discussion reply cannot be empty.")
      now = Instant.now().toString
      _ <- DiscussionTable.updateDiscussionReply(connection, request.replyId, trimmedContent, now)
      _ <- ListDiscussionsAPIMessage.refreshDiscussionReplyStats(table, connection, reply.topicId)
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, reply.topicId)
    yield DiscussionTopicMutationResponse("Discussion reply updated.", updated)
