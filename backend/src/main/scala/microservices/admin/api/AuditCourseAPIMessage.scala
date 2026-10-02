// 文件说明：后端管理端接口实现，用于处理审核课程请求并返回类型安全响应。
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
import microservices.admin.tables.CourseAuditTable
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse, MessageResponse}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.catalog.objects.{CourseAuditStatus, CourseModuleInput, CourseStatus, LessonType, UpsertCourseData}
import microservices.auth.objects.UserRole

import java.sql.Connection

final case class AuditCourseAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  auditStatus: CourseAuditStatus,
  auditComment: String
) extends ConnectionAPIMessage[CourseAuditMutationResponse]:
  override def plan(connection: Connection): IO[CourseAuditMutationResponse] =
    AuditCourseAPIMessage.schema.execute(this, connection)

object AuditCourseAPIMessage:
  val inputDecoder: Decoder[AuditCourseAPIMessage] = deriveDecoder[AuditCourseAPIMessage]
  val outputEncoder: Encoder[CourseAuditMutationResponse] = deriveEncoder[CourseAuditMutationResponse]
  val schema: ConnectionApiMessageSchema[AuditCourseAPIMessage, CourseAuditMutationResponse] = ConnectionApiMessageSchema(
    name = "AuditCourseAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(new IllegalArgumentException("input.courseId is required for AuditCourseAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            courses <- ListCoursesForUserAPIMessage(adminUser).plan(connection)
            existingCourse <- IO.fromOption(courses.find(_.id == resolvedCourseId))(new IllegalArgumentException("Course does not exist."))
            pendingRevision <- CourseAuditTable.findPendingCourseRevision(connection, resolvedCourseId)
            nextCourseStatus = input.auditStatus match
              case CourseAuditStatus.Pending => CourseStatus.Draft
              case CourseAuditStatus.Approved => CourseStatus.Published
              case CourseAuditStatus.Rejected => CourseStatus.Draft
            _ <- input.auditStatus match
              case CourseAuditStatus.Approved =>
                pendingRevision match
                  case Some(revision) => CourseAuditTable.applyPendingCourseRevision(connection, existingCourse.teacherId, revision)
                  case None => IO.unit
              case _ => IO.unit
            _ <- CourseAuditTable.upsertCourseAudit(connection, resolvedCourseId, input.auditStatus, input.auditComment, adminUser.name)
            _ <- CourseAuditTable.updateCourseStatus(connection, resolvedCourseId, nextCourseStatus)
            updatedCourses <- ListCoursesForUserAPIMessage(adminUser).plan(connection)
            course <- IO.fromOption(updatedCourses.find(_.id == resolvedCourseId))(
              new IllegalStateException("Course audited successfully but could not be reloaded.")
            )
          yield CourseAuditMutationResponse(s"Course ${course.title} audit updated.", course)
  )
  given Decoder[AuditCourseAPIMessage] = inputDecoder
  given Encoder[AuditCourseAPIMessage] = deriveEncoder[AuditCourseAPIMessage]


