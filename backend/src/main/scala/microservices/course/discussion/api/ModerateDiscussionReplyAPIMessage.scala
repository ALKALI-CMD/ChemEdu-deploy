// 文件说明：后端课程讨论接口实现，用于处理管理讨论Reply请求并返回类型安全响应。
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

final case class ModerateDiscussionReplyAPIMessage(
  sessionToken: String,
  replyId: Option[String],
  visibility: DiscussionVisibility,
  moderationNote: Option[String]
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    ModerateDiscussionReplyAPIMessage.schema.execute(this, connection)



object ModerateDiscussionReplyAPIMessage:
  val inputDecoder: Decoder[ModerateDiscussionReplyAPIMessage] = deriveDecoder[ModerateDiscussionReplyAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[ModerateDiscussionReplyAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "ModerateDiscussionReplyAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedReplyId <- IO.fromOption(input.replyId)(
              new IllegalArgumentException("input.replyId is required for ModerateDiscussionReplyAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ModerateDiscussionReplyAPIMessage.moderateDiscussionReplyForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              ModerateDiscussionReplyData(
                replyId = resolvedReplyId,
                visibility = input.visibility,
                moderationNote = input.moderationNote
              )
            )
          yield response
  )
  given Decoder[ModerateDiscussionReplyAPIMessage] = inputDecoder
  given Encoder[ModerateDiscussionReplyAPIMessage] = deriveEncoder[ModerateDiscussionReplyAPIMessage]

  private[discussion] def moderateDiscussionReplyForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    request: ModerateDiscussionReplyData
  ): IO[DiscussionTopicMutationResponse] =
    for
      reply <- ListDiscussionsAPIMessage.requireDiscussionReply(table, connection, request.replyId)
      _ <- ListDiscussionsAPIMessage.requireDiscussionModerator(table, connection, actor, reply.courseId)
      now = Instant.now().toString
      _ <- DiscussionTable.moderateDiscussionReply(connection, request.replyId, request.visibility, actor.name, now, request.moderationNote)
      _ <- ListDiscussionsAPIMessage.refreshDiscussionReplyStats(table, connection, reply.topicId)
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, reply.topicId)
    yield DiscussionTopicMutationResponse("Discussion reply moderated.", updated)
