// 文件说明：后端管理端接口实现，用于处理删除专业请求并返回类型安全响应。
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

final case class DeleteMajorAPIMessage(
  sessionToken: String,
  majorId: Option[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    DeleteMajorAPIMessage.schema.execute(this, connection)

object DeleteMajorAPIMessage:
  val inputDecoder: Decoder[DeleteMajorAPIMessage] = deriveDecoder[DeleteMajorAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[DeleteMajorAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "DeleteMajorAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedMajorId <- IO.fromOption(input.majorId)(new IllegalArgumentException("input.majorId is required for DeleteMajorAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            major <- OrganizationTable.findMajorById(connection, resolvedMajorId).flatMap(item =>
              IO.fromOption(item)(new IllegalArgumentException("Major does not exist."))
            )
            classCount <- OrganizationTable.countAcademicClassesInMajor(connection, resolvedMajorId)
            _ <- IO.raiseWhen(classCount > 0)(new IllegalArgumentException("Delete academic classes under this major first."))
            _ <- OrganizationTable.deleteMajor(connection, resolvedMajorId)
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "delete_major", "major", major.id, major.name)
            response = MessageResponse(s"Major ${major.name} deleted.")
          yield response
  )
  given Decoder[DeleteMajorAPIMessage] = inputDecoder
  given Encoder[DeleteMajorAPIMessage] = deriveEncoder[DeleteMajorAPIMessage]


