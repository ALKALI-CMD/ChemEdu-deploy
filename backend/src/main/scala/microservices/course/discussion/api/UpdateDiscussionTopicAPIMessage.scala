// 文件说明：后端课程讨论接口实现，用于处理更新讨论Topic请求并返回类型安全响应。
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

final case class UpdateDiscussionTopicAPIMessage(
  sessionToken: String,
  topicId: Option[String],
  title: String,
  content: String
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    UpdateDiscussionTopicAPIMessage.schema.execute(this, connection)



object UpdateDiscussionTopicAPIMessage:
  val inputDecoder: Decoder[UpdateDiscussionTopicAPIMessage] = deriveDecoder[UpdateDiscussionTopicAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateDiscussionTopicAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateDiscussionTopicAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedTopicId <- IO.fromOption(input.topicId)(
              new IllegalArgumentException("input.topicId is required for UpdateDiscussionTopicAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- UpdateDiscussionTopicAPIMessage.updateDiscussionTopicForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              UpdateDiscussionTopicData(
                topicId = resolvedTopicId,
                title = input.title,
                content = input.content
              )
            )
          yield response
  )
  given Decoder[UpdateDiscussionTopicAPIMessage] = inputDecoder
  given Encoder[UpdateDiscussionTopicAPIMessage] = deriveEncoder[UpdateDiscussionTopicAPIMessage]

  private[discussion] def updateDiscussionTopicForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    request: UpdateDiscussionTopicData
  ): IO[DiscussionTopicMutationResponse] =
    val trimmedTitle = request.title.trim
    val trimmedContent = request.content.trim
    for
      topic <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionAuthorOrModerator(table, connection, actor, topic.courseId, topic.authorId)
      _ <- ListDiscussionsAPIMessage.ensureNonEmpty(trimmedTitle, "Discussion title cannot be empty.")
      _ <- ListDiscussionsAPIMessage.ensureNonEmpty(trimmedContent, "Discussion content cannot be empty.")
      mentionUserIds <- ListDiscussionsAPIMessage.resolveMentionUserIds(table, connection, trimmedContent)
      sensitiveHitCount = ListDiscussionsAPIMessage.countSensitiveHits(s"$trimmedTitle $trimmedContent")
      now = Instant.now().toString
      _ <- DiscussionTable.updateDiscussionTopic(connection, request.topicId, trimmedTitle, trimmedContent, now, mentionUserIds, sensitiveHitCount)
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
    yield DiscussionTopicMutationResponse("Discussion topic updated.", updated)
