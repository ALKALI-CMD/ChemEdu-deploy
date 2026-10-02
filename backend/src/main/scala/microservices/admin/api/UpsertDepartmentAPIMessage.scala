// 文件说明：后端管理端接口实现，用于处理新增或更新院系请求并返回类型安全响应。
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
import java.util.UUID

final case class UpsertDepartmentAPIMessage(
  sessionToken: String,
  departmentId: Option[String],
  name: String
) extends ConnectionAPIMessage[DepartmentMutationResponse]:
  override def plan(connection: Connection): IO[DepartmentMutationResponse] =
    UpsertDepartmentAPIMessage.schema.execute(this, connection)

object UpsertDepartmentAPIMessage:
  val inputDecoder: Decoder[UpsertDepartmentAPIMessage] = deriveDecoder[UpsertDepartmentAPIMessage]
  val outputEncoder: Encoder[DepartmentMutationResponse] = deriveEncoder[DepartmentMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertDepartmentAPIMessage, DepartmentMutationResponse] = ConnectionApiMessageSchema(
    name = "UpsertDepartmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            name = input.name.trim
            _ <- IO.raiseWhen(name.isEmpty)(new IllegalArgumentException("Department name cannot be empty."))
            departmentId = input.departmentId.getOrElse(s"dept-${UUID.randomUUID().toString.take(8)}")
            _ <- OrganizationTable.upsertDepartment(connection, departmentId, name)
            department <- OrganizationTable.findDepartmentById(connection, departmentId).flatMap(item =>
              IO.fromOption(item)(new IllegalStateException("Department saved but could not be reloaded."))
            )
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "save_department", "department", department.id, department.name)
          yield DepartmentMutationResponse(s"Department ${department.name} saved.", department)
  )
  given Decoder[UpsertDepartmentAPIMessage] = inputDecoder
  given Encoder[UpsertDepartmentAPIMessage] = deriveEncoder[UpsertDepartmentAPIMessage]


