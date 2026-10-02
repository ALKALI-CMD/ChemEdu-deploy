// 文件说明：后端管理端接口实现，用于处理归档学期请求并返回类型安全响应。
package microservices.admin.api


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
import microservices.admin.objects.*
import microservices.admin.tables.{OrganizationChangeLogTable, OrganizationTable}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse, MessageResponse}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.catalog.objects.{CourseAuditStatus, CourseStatus}
import microservices.auth.objects.UserRole

import java.sql.Connection

final case class ArchiveSemesterAPIMessage(
  sessionToken: String,
  semesterId: Option[String],
  archiveCourses: Boolean
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    ArchiveSemesterAPIMessage.schema.execute(this, connection)

object ArchiveSemesterAPIMessage:
  val inputDecoder: Decoder[ArchiveSemesterAPIMessage] = deriveDecoder[ArchiveSemesterAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[ArchiveSemesterAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "ArchiveSemesterAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedSemesterId <- IO.fromOption(input.semesterId)(new IllegalArgumentException("input.semesterId is required for ArchiveSemesterAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            semester <- OrganizationTable.findSemesterById(connection, resolvedSemesterId).flatMap(item =>
              IO.fromOption(item)(new IllegalArgumentException("Semester does not exist."))
            )
            _ <- OrganizationTable.archiveSemester(connection, resolvedSemesterId)
            archivedCourses <- if input.archiveCourses then
              OrganizationTable.archiveSemesterCourses(connection, semester.label, CourseStatus.toString(CourseStatus.Archived))
            else IO.pure(0)
            _ <- OrganizationChangeLogTable.insert(
              connection,
              adminUser.name,
              "archive_semester",
              "semester",
              semester.id,
              if input.archiveCourses then s"Archived ${semester.label} and $archivedCourses linked courses" else s"Archived ${semester.label}"
            )
            response = MessageResponse(if input.archiveCourses then s"Semester ${semester.label} archived with $archivedCourses courses." else s"Semester ${semester.label} archived.")
          yield response
  )
  given Decoder[ArchiveSemesterAPIMessage] = inputDecoder
  given Encoder[ArchiveSemesterAPIMessage] = deriveEncoder[ArchiveSemesterAPIMessage]


