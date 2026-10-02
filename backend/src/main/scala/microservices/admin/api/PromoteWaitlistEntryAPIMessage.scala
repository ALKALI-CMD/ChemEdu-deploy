// 文件说明：后端管理端接口实现，用于处理转正候补名单Entry请求并返回类型安全响应。
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

final case class PromoteWaitlistEntryAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  userId: Option[String]
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    PromoteWaitlistEntryAPIMessage.schema.execute(this, connection)

object PromoteWaitlistEntryAPIMessage:
  val inputDecoder: Decoder[PromoteWaitlistEntryAPIMessage] = deriveDecoder[PromoteWaitlistEntryAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[PromoteWaitlistEntryAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "PromoteWaitlistEntryAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(new IllegalArgumentException("input.courseId is required for PromoteWaitlistEntryAPIMessage"))
            resolvedUserId <- IO.fromOption(input.userId)(new IllegalArgumentException("input.userId is required for PromoteWaitlistEntryAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- UpdateUserAccessAPIMessage.requireAdmin(adminUser)
            courses <- ListCoursesForUserAPIMessage(adminUser).plan(connection)
            course <- IO.fromOption(courses.find(_.id == resolvedCourseId))(new IllegalArgumentException("Course does not exist."))
            queuedPosition <- OrganizationTable.findWaitlistPosition(connection, resolvedUserId, resolvedCourseId)
            position <- IO.fromOption(queuedPosition)(new IllegalArgumentException("Waitlist entry does not exist."))
            activeCount <- OrganizationTable.countActiveEnrollmentsForCourse(connection, resolvedCourseId)
            _ <- IO.raiseWhen(activeCount >= course.capacity)(new IllegalArgumentException("This course is already full."))
            _ <- OrganizationTable.promoteWaitlistEnrollment(connection, resolvedUserId, resolvedCourseId, Instant.now().toString)
            _ <- OrganizationTable.deleteWaitlistEntry(connection, resolvedUserId, resolvedCourseId)
            _ <- OrganizationTable.decrementWaitlistPositions(connection, resolvedCourseId, position)
            _ <- syncLearningAndOrder(connection, resolvedUserId, course)
            _ <- OrganizationChangeLogTable.insert(connection, adminUser.name, "promote_waitlist", "waitlist", s"$resolvedCourseId:$resolvedUserId", s"Promoted waitlist entry for ${course.title}")
            response = MessageResponse(s"Waitlist entry for ${course.title} promoted.")
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
  given Decoder[PromoteWaitlistEntryAPIMessage] = inputDecoder
  given Encoder[PromoteWaitlistEntryAPIMessage] = deriveEncoder[PromoteWaitlistEntryAPIMessage]

