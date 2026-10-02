// 文件说明：后端课程讨论接口实现，用于处理创建讨论Topic请求并返回类型安全响应。
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

final case class CreateDiscussionTopicAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  lessonId: Option[String],
  title: String,
  content: String
) extends ConnectionAPIMessage[DiscussionTopicMutationResponse]:
  override def plan(connection: Connection): IO[DiscussionTopicMutationResponse] =
    CreateDiscussionTopicAPIMessage.schema.execute(this, connection)



object CreateDiscussionTopicAPIMessage:
  val inputDecoder: Decoder[CreateDiscussionTopicAPIMessage] = deriveDecoder[CreateDiscussionTopicAPIMessage]
  val outputEncoder: Encoder[DiscussionTopicMutationResponse] = deriveEncoder[DiscussionTopicMutationResponse]
  val schema: ConnectionApiMessageSchema[CreateDiscussionTopicAPIMessage, DiscussionTopicMutationResponse] = ConnectionApiMessageSchema(
    name = "CreateDiscussionTopicAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(
              new IllegalArgumentException("input.courseId is required for CreateDiscussionTopicAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- CreateDiscussionTopicAPIMessage.createDiscussionTopicForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              CreateDiscussionTopicData(
                courseId = resolvedCourseId,
                lessonId = input.lessonId,
                title = input.title,
                content = input.content
              )
            )
          yield response
  )
  given Decoder[CreateDiscussionTopicAPIMessage] = inputDecoder
  given Encoder[CreateDiscussionTopicAPIMessage] = deriveEncoder[CreateDiscussionTopicAPIMessage]

  private[discussion] def createDiscussionTopicForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: CreateDiscussionTopicData
  ): IO[DiscussionTopicMutationResponse] =
    val trimmedTitle = request.title.trim
    val trimmedContent = request.content.trim
    for
      _ <-
        if trimmedTitle.nonEmpty then IO.unit
        else IO.raiseError(new IllegalArgumentException("Discussion title cannot be empty."))
      _ <-
        if trimmedContent.nonEmpty then IO.unit
        else IO.raiseError(new IllegalArgumentException("Discussion content cannot be empty."))
      _ <- ListDiscussionsAPIMessage.authorizeDiscussionParticipant(table, connection, currentUser, request.courseId)
      resolvedLessonId <- ListDiscussionsAPIMessage.validateDiscussionLesson(table, connection, request.courseId, request.lessonId)
      mentionUserIds <- ListDiscussionsAPIMessage.resolveMentionUserIds(table, connection, trimmedContent)
      sensitiveHitCount = ListDiscussionsAPIMessage.countSensitiveHits(s"$trimmedTitle $trimmedContent")
      topicId = ListDiscussionsAPIMessage.generateId("discussion")
      now = Instant.now().toString
      _ <- DiscussionTable.insertDiscussionTopic(
        connection,
        topicId,
        request.courseId,
        trimmedTitle,
        currentUser.id,
        currentUser.name,
        trimmedContent,
        now,
        resolvedLessonId,
        mentionUserIds,
        sensitiveHitCount
      )
      created <- ListDiscussionsAPIMessage.findDiscussionById(table, connection, topicId)
      discussion <- IO.fromOption(created)(
        new IllegalStateException("Discussion created successfully but could not be reloaded.")
      )
    yield DiscussionTopicMutationResponse("Discussion topic created.", discussion)
