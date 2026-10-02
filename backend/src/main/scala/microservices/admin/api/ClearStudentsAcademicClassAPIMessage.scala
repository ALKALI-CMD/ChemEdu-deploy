// 文件说明：后端管理端接口实现，用于处理清空Students教学班级请求并返回类型安全响应。
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

final case class ClearStudentsAcademicClassAPIMessage(
  sessionToken: String,
  studentIds: List[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    ClearStudentsAcademicClassAPIMessage.schema.execute(this, connection)

object ClearStudentsAcademicClassAPIMessage:
  val inputDecoder: Decoder[ClearStudentsAcademicClassAPIMessage] = deriveDecoder[ClearStudentsAcademicClassAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[ClearStudentsAcademicClassAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "ClearStudentsAcademicClassAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            _ <- input.studentIds.foldLeft(IO.unit)((acc, studentId) =>
              acc.flatMap(_ => OrganizationTable.clearStudentAcademicClass(connection, studentId).void)
            )
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "clear_student_class", "student", input.studentIds.mkString(","), s"Cleared class assignment for ${input.studentIds.size} students")
            response = MessageResponse(s"Cleared class assignment for ${input.studentIds.size} students.")
          yield response
  )
  given Decoder[ClearStudentsAcademicClassAPIMessage] = inputDecoder
  given Encoder[ClearStudentsAcademicClassAPIMessage] = deriveEncoder[ClearStudentsAcademicClassAPIMessage]


