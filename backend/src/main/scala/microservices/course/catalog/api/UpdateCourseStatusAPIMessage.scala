// 文件说明：后端课程目录接口实现，用于处理更新课程状态请求并返回类型安全响应。
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
import microservices.admin.tables.CourseAuditTable
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.catalog.objects.{Course, CourseAuditStatus, CourseStatus, UpdateCourseStatusData}
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse}
import microservices.course.catalog.tables.{CourseAuthoringTable, CourseCatalogQueryTable}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class UpdateCourseStatusAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  status: CourseStatus
) extends ConnectionAPIMessage[CourseMutationResponse]:
  override def plan(connection: Connection): IO[CourseMutationResponse] =
    UpdateCourseStatusAPIMessage.schema.execute(this, connection)

object UpdateCourseStatusAPIMessage:
  val inputDecoder: Decoder[UpdateCourseStatusAPIMessage] = deriveDecoder[UpdateCourseStatusAPIMessage]
  val outputEncoder: Encoder[CourseMutationResponse] = deriveEncoder[CourseMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateCourseStatusAPIMessage, CourseMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateCourseStatusAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        resolvedCourseId <- IO.fromOption(input.courseId)(
          new IllegalArgumentException("input.courseId is required for UpdateCourseStatusAPIMessage")
        )
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        course <- updateCourseStatusForUser(
          connection,
          currentUser,
          UpdateCourseStatusData(
            courseId = resolvedCourseId,
            status = input.status
          )
        )
      yield CourseMutationResponse(
        message = s"Course ${course.title} input.status updated to ${CourseStatus.toString(course.status)}.",
        course = course
      )
  )

  private def updateCourseStatusForUser(
    connection: Connection,
    actor: UserProfile,
    request: UpdateCourseStatusData
  ): IO[Course] =
    for
      existing <- CourseCatalogQueryTable.findCourseRow(connection, request.courseId)
      courseRow <- IO.fromOption(existing)(new IllegalArgumentException("Course does not exist."))
      _ <- validateCourseOwner(actor, courseRow.teacherId)
      auditRows <- CourseAuditTable.listAuditRows(connection)
      auditStatus = auditRows.get(request.courseId).map(_.auditStatus).getOrElse(CourseAuditStatus.Pending)
      _ <-
        if request.status == CourseStatus.Published && actor.role != UserRole.Admin && auditStatus != CourseAuditStatus.Approved then
          IO.raiseError(new IllegalArgumentException("Only approved courses can be published by teachers."))
        else IO.unit
      _ <- CourseAuthoringTable.updateCourseStatus(connection, request.courseId, request.status)
      updated <- FindCourseByIdAPIMessage.findCourseByIdForUser(connection, request.courseId, actor, Map.empty, Map.empty)
      result <- IO.fromOption(updated)(
        new IllegalStateException("Course status updated successfully but could not be reloaded.")
      )
    yield result

  private def validateCourseOwner(actor: UserProfile, teacherId: String): IO[Unit] =
    if actor.role == UserRole.Admin || actor.id == teacherId then IO.unit
    else IO.raiseError(new IllegalArgumentException("You do not have permission to modify this course."))

  given Decoder[UpdateCourseStatusAPIMessage] = inputDecoder
  given Encoder[UpdateCourseStatusAPIMessage] = deriveEncoder[UpdateCourseStatusAPIMessage]
