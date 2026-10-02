// 文件说明：后端课程讨论接口实现，用于处理切换讨论互动反应请求并返回类型安全响应。
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

final case class ToggleDiscussionReactionAPIMessage(
  sessionToken: String,
  topicId: Option[String],
  reactionType: String
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    ToggleDiscussionReactionAPIMessage.schema.execute(this, connection)



object ToggleDiscussionReactionAPIMessage:
  val inputDecoder: Decoder[ToggleDiscussionReactionAPIMessage] = deriveDecoder[ToggleDiscussionReactionAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[ToggleDiscussionReactionAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "ToggleDiscussionReactionAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedTopicId <- IO.fromOption(input.topicId)(
              new IllegalArgumentException("input.topicId is required for ToggleDiscussionReactionAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ToggleDiscussionReactionAPIMessage.toggleDiscussionReactionForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              ToggleDiscussionReactionData(resolvedTopicId, input.reactionType)
            )
          yield response
  )
  given Decoder[ToggleDiscussionReactionAPIMessage] = inputDecoder
  given Encoder[ToggleDiscussionReactionAPIMessage] = deriveEncoder[ToggleDiscussionReactionAPIMessage]

  private[discussion] def toggleDiscussionReactionForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: ToggleDiscussionReactionData
  ): IO[DiscussionTopicMutationResponse] =
    val reactionType = request.reactionType.trim.toLowerCase
    for
      topic <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionParticipant(table, connection, currentUser, topic.courseId)
      _ <-
        if Set("like", "favorite", "report").contains(reactionType) then IO.unit
        else IO.raiseError(new IllegalArgumentException("Unsupported discussion reaction."))
      existing <- DiscussionTable.findDiscussionReaction(connection, currentUser.id, request.topicId, reactionType)
      _ <-
        if existing then
          DiscussionTable.deleteDiscussionReaction(connection, currentUser.id, request.topicId, reactionType)
        else
          DiscussionTable.insertDiscussionReaction(connection, currentUser.id, request.topicId, reactionType, Instant.now().toString)
      _ <-
        if reactionType == "report" && !existing then
          DiscussionTable.appendDiscussionReportNote(connection, request.topicId, s"\nReported by ${currentUser.name} at ${Instant.now().toString}.")
        else IO.unit
      updated <- ListDiscussionsAPIMessage.requireDiscussionTopic(table, connection, request.topicId)
    yield DiscussionTopicMutationResponse("Discussion interaction updated.", updated)
