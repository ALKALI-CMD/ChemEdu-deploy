// 文件说明：后端管理端接口实现，用于处理删除教学班级请求并返回类型安全响应。
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

final case class DeleteAcademicClassAPIMessage(
  sessionToken: String,
  academicClassId: Option[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    DeleteAcademicClassAPIMessage.schema.execute(this, connection)

object DeleteAcademicClassAPIMessage:
  val inputDecoder: Decoder[DeleteAcademicClassAPIMessage] = deriveDecoder[DeleteAcademicClassAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[DeleteAcademicClassAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "DeleteAcademicClassAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedAcademicClassId <- IO.fromOption(input.academicClassId)(new IllegalArgumentException("input.academicClassId is required for DeleteAcademicClassAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            academicClass <- OrganizationTable.findAcademicClassById(connection, resolvedAcademicClassId).flatMap(item =>
              IO.fromOption(item)(new IllegalArgumentException("Academic class does not exist."))
            )
            _ <- IO.raiseWhen(academicClass.studentIds.nonEmpty)(new IllegalArgumentException("Move students out of this class first."))
            courseCount <- OrganizationTable.countCoursesLinkedToAcademicClass(connection, resolvedAcademicClassId)
            _ <- IO.raiseWhen(courseCount > 0)(new IllegalArgumentException("Remove this class from courses first."))
            _ <- OrganizationTable.deleteAcademicClass(connection, resolvedAcademicClassId)
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "delete_academic_class", "academic_class", academicClass.id, academicClass.name)
            response = MessageResponse(s"Academic class ${academicClass.name} deleted.")
          yield response
  )
  given Decoder[DeleteAcademicClassAPIMessage] = inputDecoder
  given Encoder[DeleteAcademicClassAPIMessage] = deriveEncoder[DeleteAcademicClassAPIMessage]


