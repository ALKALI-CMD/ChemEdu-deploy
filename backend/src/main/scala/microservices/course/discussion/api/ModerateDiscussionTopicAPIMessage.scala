// 文件说明：后端课程讨论接口实现，用于处理管理讨论Topic请求并返回类型安全响应。
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

final case class ModerateDiscussionTopicAPIMessage(
  sessionToken: String,
  topicId: Option[String],
  visibility: DiscussionVisibility,
  threadState: DiscussionThreadState,
  pinState: DiscussionPinState,
  resolved: Boolean,
  moderationNote: Option[String]
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    ModerateDiscussionTopicAPIMessage.schema.execute(this, connection)



object ModerateDiscussionTopicAPIMessage:
  val inputDecoder: Decoder[ModerateDiscussionTopicAPIMessage] = deriveDecoder[ModerateDiscussionTopicAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[ModerateDiscussionTopicAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "ModerateDiscussionTopicAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedTopicId <- IO.fromOption(input.topicId)(
              new IllegalArgumentException("input.topicId is required for ModerateDiscussionTopicAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ModerateDiscussionTopicAPIMessage.moderateDiscussionTopicForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              ModerateDiscussionTopicData(
                topicId = resolvedTopicId,
                visibility = input.visibility,
                threadState = input.threadState,
                pinState = input.pinState,
                resolved = input.resolved,
                moderationNote = input.moderationNote
              )
            )
          yield response
  )
  given Decoder[ModerateDiscussionTopicAPIMessage] = inputDecoder
  given Encoder[ModerateDiscussionTopicAPIMessage] = deriveEncoder[ModerateDiscussionTopicAPIMessage]

  private[discussion] def moderateDiscussionTopicForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    request: ModerateDiscussionTopicData
  ): IO[DiscussionTopicMutationResponse] =
    for
      topic <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
      _ <- ListDiscussionsAPIMessage.requireDiscussionModerator(table, connection, actor, topic.courseId)
      now = Instant.now().toString
      _ <- DiscussionTable.moderateDiscussionTopic(
        connection,
        request.topicId,
        request.visibility,
        request.threadState,
        request.pinState,
        request.resolved,
        actor.name,
        now,
        request.moderationNote
      )
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
    yield DiscussionTopicMutationResponse("Discussion topic moderated.", updated)
