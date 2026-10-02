// 文件说明：后端管理端接口实现，用于处理新增或更新教学班级请求并返回类型安全响应。
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

final case class UpsertAcademicClassAPIMessage(
  sessionToken: String,
  academicClassId: Option[String],
  majorId: String,
  grade: String,
  name: String,
  capacity: Int
) extends ConnectionAPIMessage[AcademicClassMutationResponse]:
  override def plan(connection: Connection): IO[AcademicClassMutationResponse] =
    UpsertAcademicClassAPIMessage.schema.execute(this, connection)

object UpsertAcademicClassAPIMessage:
  val inputDecoder: Decoder[UpsertAcademicClassAPIMessage] = deriveDecoder[UpsertAcademicClassAPIMessage]
  val outputEncoder: Encoder[AcademicClassMutationResponse] = deriveEncoder[AcademicClassMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertAcademicClassAPIMessage, AcademicClassMutationResponse] = ConnectionApiMessageSchema(
    name = "UpsertAcademicClassAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            name = input.name.trim
            grade = input.grade.trim
            _ <- IO.raiseWhen(name.isEmpty)(new IllegalArgumentException("Class name cannot be empty."))
            _ <- IO.raiseWhen(grade.isEmpty)(new IllegalArgumentException("Grade cannot be empty."))
            _ <- IO.raiseWhen(input.capacity <= 0)(new IllegalArgumentException("Capacity must be greater than 0."))
            major <- OrganizationTable.findMajorById(connection, input.majorId)
            _ <- IO.raiseWhen(major.isEmpty)(new IllegalArgumentException("Major does not exist."))
            academicClassId = input.academicClassId.getOrElse(s"class-${UUID.randomUUID().toString.take(8)}")
            _ <- OrganizationTable.upsertAcademicClass(connection, academicClassId, input.majorId, grade, name, input.capacity)
            academicClass <- OrganizationTable.findAcademicClassById(connection, academicClassId).flatMap(item =>
              IO.fromOption(item)(new IllegalStateException("Academic class saved but could not be reloaded."))
            )
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "save_academic_class", "academic_class", academicClass.id, academicClass.name)
          yield AcademicClassMutationResponse(s"Academic class ${academicClass.name} saved.", academicClass)
  )
  given Decoder[UpsertAcademicClassAPIMessage] = inputDecoder
  given Encoder[UpsertAcademicClassAPIMessage] = deriveEncoder[UpsertAcademicClassAPIMessage]


