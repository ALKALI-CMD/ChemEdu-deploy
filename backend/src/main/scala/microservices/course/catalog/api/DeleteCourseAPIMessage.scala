// 文件说明：后端课程目录接口实现，用于处理删除课程请求并返回类型安全响应。
package microservices.course.catalog.api

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
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.catalog.objects.{CourseStatus, DeleteCourseData}
import microservices.course.catalog.objects.apiTypes.{MessageResponse}
import microservices.course.catalog.tables.{CourseAuthoringTable, CourseCatalogQueryTable, CourseTable}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class DeleteCourseAPIMessage(
  sessionToken: String,
  courseId: Option[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    DeleteCourseAPIMessage.schema.execute(this, connection)

object DeleteCourseAPIMessage:
  val inputDecoder: Decoder[DeleteCourseAPIMessage] = deriveDecoder[DeleteCourseAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[DeleteCourseAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "DeleteCourseAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        resolvedCourseId <- IO.fromOption(input.courseId)(
          new IllegalArgumentException("input.courseId is required for DeleteCourseAPIMessage")
        )
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        response <- deleteCourseForUser(
          connection,
          currentUser,
          DeleteCourseData(courseId = resolvedCourseId)
        )
      yield response
  )

  private def deleteCourseForUser(
    connection: Connection,
    actor: UserProfile,
    request: DeleteCourseData
  ): IO[MessageResponse] =
    for
      _ <-
        if actor.role == UserRole.Admin then IO.unit
        else IO.raiseError(new IllegalArgumentException("Only admins can delete courses."))
      existing <- CourseCatalogQueryTable.findCourseRow(connection, request.courseId)
      courseRow <- IO.fromOption(existing)(new IllegalArgumentException("Course does not exist."))
      _ <-
        if courseRow.status == CourseStatus.Published then
          IO.raiseError(new IllegalArgumentException("Published courses must be taken down before deletion."))
        else IO.unit
      enrollmentCount <- CourseTable.countCourseEnrollments(connection, request.courseId)
      _ <-
        if enrollmentCount > 0 then
          IO.raiseError(new IllegalArgumentException("Courses with enrolled students cannot be deleted."))
        else IO.unit
      _ <- CourseAuthoringTable.deleteCourse(connection, request.courseId)
    yield MessageResponse(s"Course ${courseRow.title} deleted.")

  given Decoder[DeleteCourseAPIMessage] = inputDecoder
  given Encoder[DeleteCourseAPIMessage] = deriveEncoder[DeleteCourseAPIMessage]