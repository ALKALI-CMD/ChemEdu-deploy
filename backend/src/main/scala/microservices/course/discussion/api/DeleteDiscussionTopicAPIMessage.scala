// 文件说明：后端课程讨论接口实现，用于处理删除讨论Topic请求并返回类型安全响应。
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

final case class DeleteDiscussionTopicAPIMessage(
  sessionToken: String,
  topicId: Option[String]
) extends ConnectionAPIMessage[DiscussionDeletionResponse]:
  override def plan(connection: Connection): IO[DiscussionDeletionResponse] =
    DeleteDiscussionTopicAPIMessage.schema.execute(this, connection)



object DeleteDiscussionTopicAPIMessage:
  val inputDecoder: Decoder[DeleteDiscussionTopicAPIMessage] = deriveDecoder[DeleteDiscussionTopicAPIMessage]
  val outputEncoder: Encoder[DiscussionDeletionResponse] = deriveEncoder[DiscussionDeletionResponse]
  val schema: ConnectionApiMessageSchema[DeleteDiscussionTopicAPIMessage, DiscussionDeletionResponse] = ConnectionApiMessageSchema(
    name = "DeleteDiscussionTopicAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedTopicId <- IO.fromOption(input.topicId)(
              new IllegalArgumentException("input.topicId is required for DeleteDiscussionTopicAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- DeleteDiscussionTopicAPIMessage.deleteDiscussionTopicForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              DeleteDiscussionTopicData(resolvedTopicId)
            )
          yield response
  )
  given Decoder[DeleteDiscussionTopicAPIMessage] = inputDecoder
  given Encoder[DeleteDiscussionTopicAPIMessage] = deriveEncoder[DeleteDiscussionTopicAPIMessage]

  private[discussion] def deleteDiscussionTopicForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    request: DeleteDiscussionTopicData
  ): IO[DiscussionDeletionResponse] =
    for
      topic <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionAuthorOrModerator(table, connection, actor, topic.courseId, topic.authorId)
      _ <- DiscussionTable.deleteDiscussionTopic(connection, request.topicId)
    yield DiscussionDeletionResponse("Discussion topic deleted.", request.topicId)
