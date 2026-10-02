// 文件说明：后端管理端接口实现，用于处理评价/批改报名请求并返回类型安全响应。
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
import microservices.admin.tables.{BusinessOpsTable, OrganizationChangeLogTable, OrganizationTable, UserAccessTable}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse, MessageResponse}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.catalog.objects.{Course, CourseAuditStatus}
import microservices.auth.objects.UserRole
import microservices.course.learning.api.SyncLearningArtifactsForEnrollmentAPIMessage

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class ReviewEnrollmentAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  userId: Option[String],
  approved: Boolean
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    ReviewEnrollmentAPIMessage.schema.execute(this, connection)

object ReviewEnrollmentAPIMessage:
  val inputDecoder: Decoder[ReviewEnrollmentAPIMessage] = deriveDecoder[ReviewEnrollmentAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[ReviewEnrollmentAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "ReviewEnrollmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(new IllegalArgumentException("input.courseId is required for ReviewEnrollmentAPIMessage"))
            resolvedUserId <- IO.fromOption(input.userId)(new IllegalArgumentException("input.userId is required for ReviewEnrollmentAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            courses <- ListCoursesForUserAPIMessage(adminUser).plan(connection)
            course <- IO.fromOption(courses.find(_.id == resolvedCourseId))(new IllegalArgumentException("Course does not exist."))
            pendingEnrollment <- OrganizationTable.findEnrollmentStatus(connection, resolvedUserId, resolvedCourseId)
            status <- IO.fromOption(pendingEnrollment)(new IllegalArgumentException("Enrollment request does not exist."))
            _ <- IO.raiseWhen(status != "pending")(new IllegalArgumentException("Only pending enrollment requests can be reviewed."))
            activeCount <- OrganizationTable.countActiveEnrollmentsForCourse(connection, resolvedCourseId)
            _ <- IO.raiseWhen(input.approved && activeCount >= course.capacity)(new IllegalArgumentException("This course is already full."))
            nextStatus = if input.approved then "enrolled" else "rejected"
            _ <- OrganizationTable.updateEnrollmentStatus(connection, resolvedUserId, resolvedCourseId, nextStatus, Instant.now().toString)
            _ <- if input.approved then syncLearningAndOrder(connection, resolvedUserId, course) else IO.unit
            _ <- OrganizationChangeLogTable.insert(
              connection,
              adminUser.name,
              if input.approved then "approve_enrollment" else "reject_enrollment",
              "enrollment",
              s"$resolvedCourseId:$resolvedUserId",
              if input.approved then s"Approved enrollment for ${course.title}" else s"Rejected enrollment for ${course.title}"
            )
            response = MessageResponse(if input.approved then s"Enrollment for ${course.title} approved." else s"Enrollment for ${course.title} rejected.")
          yield response
  )
  private def syncLearningAndOrder(connection: Connection, userId: String, course: Course): IO[Unit] =
    for
      _ <- SyncLearningArtifactsForEnrollmentAPIMessage(userId, course.id).plan(connection)
      user <- UserAccessTable.findById(connection, userId).flatMap(item =>
        IO.fromOption(item)(new IllegalArgumentException("User does not exist."))
      )
      _ <- BusinessOpsTable.insertPaidOrder(
        connection,
        s"ORD-${UUID.randomUUID().toString.take(8).toUpperCase}",
        user.name,
        course.title,
        course.price,
        "paid",
        Instant.now().toString
      )
    yield ()
  given Decoder[ReviewEnrollmentAPIMessage] = inputDecoder
  given Encoder[ReviewEnrollmentAPIMessage] = deriveEncoder[ReviewEnrollmentAPIMessage]

