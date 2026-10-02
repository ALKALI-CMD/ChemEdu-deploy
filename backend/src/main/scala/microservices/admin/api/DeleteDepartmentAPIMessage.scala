// 文件说明：后端管理端接口实现，用于处理删除院系请求并返回类型安全响应。
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

final case class DeleteDepartmentAPIMessage(
  sessionToken: String,
  departmentId: Option[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    DeleteDepartmentAPIMessage.schema.execute(this, connection)

object DeleteDepartmentAPIMessage:
  val inputDecoder: Decoder[DeleteDepartmentAPIMessage] = deriveDecoder[DeleteDepartmentAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[DeleteDepartmentAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "DeleteDepartmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedDepartmentId <- IO.fromOption(input.departmentId)(new IllegalArgumentException("input.departmentId is required for DeleteDepartmentAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            department <- OrganizationTable.findDepartmentById(connection, resolvedDepartmentId).flatMap(item =>
              IO.fromOption(item)(new IllegalArgumentException("Department does not exist."))
            )
            majorCount <- OrganizationTable.countMajorsInDepartment(connection, resolvedDepartmentId)
            _ <- IO.raiseWhen(majorCount > 0)(new IllegalArgumentException("Delete majors under this department first."))
            _ <- OrganizationTable.deleteDepartment(connection, resolvedDepartmentId)
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "delete_department", "department", department.id, department.name)
            response = MessageResponse(s"Department ${department.name} deleted.")
          yield response
  )
  given Decoder[DeleteDepartmentAPIMessage] = inputDecoder
  given Encoder[DeleteDepartmentAPIMessage] = deriveEncoder[DeleteDepartmentAPIMessage]


