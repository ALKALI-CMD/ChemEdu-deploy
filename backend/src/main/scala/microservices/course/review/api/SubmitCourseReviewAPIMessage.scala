// 文件说明：后端课程评价接口实现，用于处理提交课程评价/批改请求并返回类型安全响应。
package microservices.course.review.api


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
import microservices.auth.objects.UserRole
import microservices.course.catalog.api.{AuthorizeCourseParticipantAPIMessage, FindCourseByIdAPIMessage}
import microservices.course.review.objects.{SubmitCourseReviewData}
import microservices.course.review.objects.apiTypes.{CourseReviewMutationResponse}
import microservices.course.review.tables.ReviewTable
import system.api.ConnectionApiMessageSchema
import system.api.ConnectionAPIMessage

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class SubmitCourseReviewAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  rating: Int,
  content: String
) extends ConnectionAPIMessage[CourseReviewMutationResponse]:
  override def plan(connection: Connection): IO[CourseReviewMutationResponse] =
    SubmitCourseReviewAPIMessage.schema.execute(this, connection)

object SubmitCourseReviewAPIMessage:
  val inputDecoder: Decoder[SubmitCourseReviewAPIMessage] = deriveDecoder[SubmitCourseReviewAPIMessage]
  val outputEncoder: Encoder[CourseReviewMutationResponse] = deriveEncoder[CourseReviewMutationResponse]
  val schema: ConnectionApiMessageSchema[SubmitCourseReviewAPIMessage, CourseReviewMutationResponse] = ConnectionApiMessageSchema(
    name = "SubmitCourseReviewAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(
              new IllegalArgumentException("input.courseId is required for SubmitCourseReviewAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- submitCourseReviewForUser(
              connection = connection,
              currentUser = currentUser,
              request = SubmitCourseReviewData(
                courseId = resolvedCourseId,
                rating = input.rating,
                content = input.content
              )
            )
          yield response
  )

  private def submitCourseReviewForUser(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    request: SubmitCourseReviewData
  ): IO[CourseReviewMutationResponse] =
    val trimmedContent = request.content.trim
    for
      _ <- if currentUser.role == UserRole.Student then IO.unit else IO.raiseError(new IllegalArgumentException("Only students can submit course reviews."))
      _ <- if request.rating >= 1 && request.rating <= 5 then IO.unit else IO.raiseError(new IllegalArgumentException("Course rating must be between 1 and 5."))
      _ <- ensureNonEmpty(trimmedContent, "Course review content cannot be empty.")
      course <- FindCourseByIdAPIMessage(request.courseId, currentUser).plan(connection)
      _ <- IO.fromOption(course)(new IllegalArgumentException("Course does not exist."))
      _ <- AuthorizeCourseParticipantAPIMessage(currentUser, request.courseId).plan(connection).void
      existingReview <- ReviewTable.findCourseReviewByCourseAndUser(connection, request.courseId, currentUser.id)
      reviewId = existingReview.map(_.id).getOrElse(generateId("course-review"))
      createdAt = existingReview.map(_.createdAt).getOrElse(Instant.now().toString)
      updatedAt = Instant.now().toString
      _ <- ReviewTable.upsertCourseReview(
        connection,
        reviewId,
        request.courseId,
        currentUser.id,
        currentUser.name,
        request.rating,
        trimmedContent,
        createdAt,
        updatedAt
      )
      _ <- ReviewTable.refreshCourseRating(connection, request.courseId)
      review <- ReviewTable.findCourseReviewByCourseAndUser(connection, request.courseId, currentUser.id).flatMap(result =>
        IO.fromOption(result)(new IllegalStateException("Course review saved successfully but could not be reloaded."))
      )
    yield CourseReviewMutationResponse("Course review saved.", review)

  private def ensureNonEmpty(value: String, message: String): IO[Unit] =
    if value.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException(message))

  private def generateId(prefix: String): String =
    s"$prefix-${UUID.randomUUID().toString.take(8)}"

  given Decoder[SubmitCourseReviewAPIMessage] = inputDecoder
  given Encoder[SubmitCourseReviewAPIMessage] = deriveEncoder[SubmitCourseReviewAPIMessage]


