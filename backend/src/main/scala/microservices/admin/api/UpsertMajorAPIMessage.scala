// 文件说明：后端管理端接口实现，用于处理新增或更新专业请求并返回类型安全响应。
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

final case class UpsertMajorAPIMessage(
  sessionToken: String,
  majorId: Option[String],
  departmentId: String,
  name: String
) extends ConnectionAPIMessage[MajorMutationResponse]:
  override def plan(connection: Connection): IO[MajorMutationResponse] =
    UpsertMajorAPIMessage.schema.execute(this, connection)

object UpsertMajorAPIMessage:
  val inputDecoder: Decoder[UpsertMajorAPIMessage] = deriveDecoder[UpsertMajorAPIMessage]
  val outputEncoder: Encoder[MajorMutationResponse] = deriveEncoder[MajorMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertMajorAPIMessage, MajorMutationResponse] = ConnectionApiMessageSchema(
    name = "UpsertMajorAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            name = input.name.trim
            _ <- IO.raiseWhen(name.isEmpty)(new IllegalArgumentException("Major name cannot be empty."))
            department <- OrganizationTable.findDepartmentById(connection, input.departmentId)
            _ <- IO.raiseWhen(department.isEmpty)(new IllegalArgumentException("Department does not exist."))
            majorId = input.majorId.getOrElse(s"major-${UUID.randomUUID().toString.take(8)}")
            _ <- OrganizationTable.upsertMajor(connection, majorId, input.departmentId, name)
            major <- OrganizationTable.findMajorById(connection, majorId).flatMap(item =>
              IO.fromOption(item)(new IllegalStateException("Major saved but could not be reloaded."))
            )
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "save_major", "major", major.id, major.name)
          yield MajorMutationResponse(s"Major ${major.name} saved.", major)
  )
  given Decoder[UpsertMajorAPIMessage] = inputDecoder
  given Encoder[UpsertMajorAPIMessage] = deriveEncoder[UpsertMajorAPIMessage]


