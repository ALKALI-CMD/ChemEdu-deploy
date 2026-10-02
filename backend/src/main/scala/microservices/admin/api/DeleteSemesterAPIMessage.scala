// 文件说明：后端管理端接口实现，用于处理删除学期请求并返回类型安全响应。
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
import microservices.course.catalog.objects.CourseAuditStatus
import microservices.auth.objects.UserRole

import java.sql.Connection

final case class DeleteSemesterAPIMessage(
  sessionToken: String,
  semesterId: Option[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    DeleteSemesterAPIMessage.schema.execute(this, connection)

object DeleteSemesterAPIMessage:
  val inputDecoder: Decoder[DeleteSemesterAPIMessage] = deriveDecoder[DeleteSemesterAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[DeleteSemesterAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "DeleteSemesterAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedSemesterId <- IO.fromOption(input.semesterId)(new IllegalArgumentException("input.semesterId is required for DeleteSemesterAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            semester <- OrganizationTable.findSemesterById(connection, resolvedSemesterId).flatMap(item =>
              IO.fromOption(item)(new IllegalArgumentException("Semester does not exist."))
            )
            courseCount <- OrganizationTable.countCoursesInSemester(connection, semester.label)
            _ <- IO.raiseWhen(courseCount > 0)(new IllegalArgumentException("Courses are still linked to this semester."))
            _ <- OrganizationTable.deleteSemester(connection, resolvedSemesterId)
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "delete_semester", "semester", semester.id, semester.label)
            response = MessageResponse(s"Semester ${semester.label} deleted.")
          yield response
  )
  given Decoder[DeleteSemesterAPIMessage] = inputDecoder
  given Encoder[DeleteSemesterAPIMessage] = deriveEncoder[DeleteSemesterAPIMessage]


