// 文件说明：后端管理端接口实现，用于处理更新课程教学Classes请求并返回类型安全响应。
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
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse, MessageResponse}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.catalog.objects.CourseAuditStatus
import microservices.auth.objects.UserRole

import java.sql.Connection

final case class UpdateCourseAcademicClassesAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  academicClassIds: List[String]
) extends ConnectionAPIMessage[CourseMutationResponse]:
  override def plan(connection: Connection): IO[CourseMutationResponse] =
    UpdateCourseAcademicClassesAPIMessage.schema.execute(this, connection)

object UpdateCourseAcademicClassesAPIMessage:
  val inputDecoder: Decoder[UpdateCourseAcademicClassesAPIMessage] = deriveDecoder[UpdateCourseAcademicClassesAPIMessage]
  val outputEncoder: Encoder[CourseMutationResponse] = deriveEncoder[CourseMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateCourseAcademicClassesAPIMessage, CourseMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateCourseAcademicClassesAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(new IllegalArgumentException("input.courseId is required for UpdateCourseAcademicClassesAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            _ <- input.academicClassIds.foldLeft(IO.unit)((acc, academicClassId) =>
              acc.flatMap(_ =>
                OrganizationTable.findAcademicClassById(connection, academicClassId).flatMap(item =>
                  IO.raiseWhen(item.isEmpty)(new IllegalArgumentException(s"Academic class $academicClassId does not exist."))
                )
              )
            )
            courses <- ListCoursesForUserAPIMessage(adminUser).plan(connection)
            existingCourse <- IO.fromOption(courses.find(_.id == resolvedCourseId))(new IllegalArgumentException("Course does not exist."))
            totalClassCapacity <- input.academicClassIds.foldLeft(IO.pure(0)) { (acc, classId) =>
              for
                current <- acc
                academicClass <- OrganizationTable.findAcademicClassById(connection, classId).flatMap(item =>
                  IO.fromOption(item)(new IllegalArgumentException(s"Academic class $classId does not exist."))
                )
              yield current + academicClass.capacity
            }
            _ <- IO.raiseWhen(input.academicClassIds.nonEmpty && existingCourse.capacity > totalClassCapacity)(
              new IllegalArgumentException("Course capacity cannot exceed the total capacity of assigned academic classes.")
            )
            _ <- IO.raiseWhen(input.academicClassIds.nonEmpty && existingCourse.enrolledCount > totalClassCapacity)(
              new IllegalArgumentException("Current enrolled count exceeds the total capacity of assigned academic classes.")
            )
            _ <- OrganizationTable.updateCourseAcademicClasses(connection, resolvedCourseId, input.academicClassIds)
            updatedCourses <- ListCoursesForUserAPIMessage(adminUser).plan(connection)
            course <- IO.fromOption(updatedCourses.find(_.id == resolvedCourseId))(new IllegalArgumentException("Course does not exist."))
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "assign_course_classes", "course", resolvedCourseId, input.academicClassIds.mkString(","))
          yield CourseMutationResponse(s"Course ${course.title} academic classes updated.", course)
  )
  given Decoder[UpdateCourseAcademicClassesAPIMessage] = inputDecoder
  given Encoder[UpdateCourseAcademicClassesAPIMessage] = deriveEncoder[UpdateCourseAcademicClassesAPIMessage]


