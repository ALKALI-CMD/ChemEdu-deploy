// 文件说明：后端管理端接口实现，用于处理分配StudentsTo教学班级请求并返回类型安全响应。
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

final case class AssignStudentsToAcademicClassAPIMessage(
  sessionToken: String,
  academicClassId: Option[String],
  studentIds: List[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    AssignStudentsToAcademicClassAPIMessage.schema.execute(this, connection)

object AssignStudentsToAcademicClassAPIMessage:
  val inputDecoder: Decoder[AssignStudentsToAcademicClassAPIMessage] = deriveDecoder[AssignStudentsToAcademicClassAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[AssignStudentsToAcademicClassAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "AssignStudentsToAcademicClassAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedAcademicClassId <- IO.fromOption(input.academicClassId)(new IllegalArgumentException("input.academicClassId is required for AssignStudentsToAcademicClassAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            academicClass <- OrganizationTable.findAcademicClassById(connection, resolvedAcademicClassId).flatMap(item =>
              IO.fromOption(item)(new IllegalArgumentException("Academic class does not exist."))
            )
            major <- OrganizationTable.findMajorById(connection, academicClass.majorId).flatMap(item =>
              IO.fromOption(item)(new IllegalStateException("Major does not exist."))
            )
            department <- OrganizationTable.findDepartmentById(connection, major.departmentId).flatMap(item =>
              IO.fromOption(item)(new IllegalStateException("Department does not exist."))
            )
            incomingStudentIds = input.studentIds.distinct.filterNot(academicClass.studentIds.contains)
            _ <- IO.raiseWhen(academicClass.studentIds.toSet.size + incomingStudentIds.size > academicClass.capacity)(
              new IllegalArgumentException("The target academic class does not have enough capacity.")
            )
            _ <- input.studentIds.foldLeft(IO.unit)((acc, studentId) =>
              acc.flatMap(_ => OrganizationTable.assignStudentToAcademicClass(connection, department, major, academicClass, studentId).void)
            )
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "assign_students_to_class", "academic_class", academicClass.id, s"${input.studentIds.size} students assigned to ${academicClass.name}")
            response = MessageResponse(s"${input.studentIds.size} students assigned to ${academicClass.name}.")
          yield response
  )
  given Decoder[AssignStudentsToAcademicClassAPIMessage] = inputDecoder
  given Encoder[AssignStudentsToAcademicClassAPIMessage] = deriveEncoder[AssignStudentsToAcademicClassAPIMessage]


