// 文件说明：后端管理端接口实现，用于处理新增或更新学期请求并返回类型安全响应。
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

final case class UpsertSemesterAPIMessage(
  sessionToken: String,
  semesterId: Option[String],
  label: String,
  startAt: String,
  endAt: String,
  archived: Boolean
) extends ConnectionAPIMessage[SemesterMutationResponse]:
  override def plan(connection: Connection): IO[SemesterMutationResponse] =
    UpsertSemesterAPIMessage.schema.execute(this, connection)

object UpsertSemesterAPIMessage:
  val inputDecoder: Decoder[UpsertSemesterAPIMessage] = deriveDecoder[UpsertSemesterAPIMessage]
  val outputEncoder: Encoder[SemesterMutationResponse] = deriveEncoder[SemesterMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertSemesterAPIMessage, SemesterMutationResponse] = ConnectionApiMessageSchema(
    name = "UpsertSemesterAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            label = input.label.trim
            startAt = input.startAt.trim
            endAt = input.endAt.trim
            _ <- IO.raiseWhen(label.isEmpty)(new IllegalArgumentException("Semester label cannot be empty."))
            _ <- IO.raiseWhen(startAt.isEmpty || endAt.isEmpty)(new IllegalArgumentException("Semester dates cannot be empty."))
            semesterId = input.semesterId.getOrElse(s"semester-${UUID.randomUUID().toString.take(8)}")
            _ <- OrganizationTable.upsertSemester(connection, semesterId, label, startAt, endAt, input.archived)
            semester <- OrganizationTable.findSemesterById(connection, semesterId).flatMap(item =>
              IO.fromOption(item)(new IllegalStateException("Semester saved but could not be reloaded."))
            )
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "save_semester", "semester", semester.id, semester.label)
          yield SemesterMutationResponse(s"Semester ${semester.label} saved.", semester)
  )
  given Decoder[UpsertSemesterAPIMessage] = inputDecoder
  given Encoder[UpsertSemesterAPIMessage] = deriveEncoder[UpsertSemesterAPIMessage]


