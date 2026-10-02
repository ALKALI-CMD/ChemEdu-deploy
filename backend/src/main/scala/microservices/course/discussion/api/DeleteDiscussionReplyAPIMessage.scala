// 文件说明：后端课程讨论接口实现，用于处理删除讨论Reply请求并返回类型安全响应。
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

final case class DeleteDiscussionReplyAPIMessage(
  sessionToken: String,
  replyId: Option[String]
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    DeleteDiscussionReplyAPIMessage.schema.execute(this, connection)



object DeleteDiscussionReplyAPIMessage:
  val inputDecoder: Decoder[DeleteDiscussionReplyAPIMessage] = deriveDecoder[DeleteDiscussionReplyAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[DeleteDiscussionReplyAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "DeleteDiscussionReplyAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedReplyId <- IO.fromOption(input.replyId)(
              new IllegalArgumentException("input.replyId is required for DeleteDiscussionReplyAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- DeleteDiscussionReplyAPIMessage.deleteDiscussionReplyForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              DeleteDiscussionReplyData(resolvedReplyId)
            )
          yield response
  )
  given Decoder[DeleteDiscussionReplyAPIMessage] = inputDecoder
  given Encoder[DeleteDiscussionReplyAPIMessage] = deriveEncoder[DeleteDiscussionReplyAPIMessage]

  private[discussion] def deleteDiscussionReplyForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    request: DeleteDiscussionReplyData
  ): IO[DiscussionTopicMutationResponse] =
    for
      reply <- ListDiscussionsAPIMessage.requireDiscussionReply(table, connection, request.replyId)
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionAuthorOrModerator(table, connection, actor, reply.courseId, reply.authorId)
      _ <- DiscussionTable.deleteDiscussionReply(connection, request.replyId)
      _ <- ListDiscussionsAPIMessage.refreshDiscussionReplyStats(table, connection, reply.topicId)
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, reply.topicId)
    yield DiscussionTopicMutationResponse("Discussion reply deleted.", updated)
