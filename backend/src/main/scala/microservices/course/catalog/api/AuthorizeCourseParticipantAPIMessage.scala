// 文件说明：后端课程目录接口实现，用于处理授权课程Participant请求并返回类型安全响应。
package microservices.course.catalog.api

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
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.catalog.tables.CourseTable
import microservices.course.catalog.objects.apiTypes.MessageResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class AuthorizeCourseParticipantAPIMessage(
  user: UserProfile,
  courseId: String
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    AuthorizeCourseParticipantAPIMessage.authorize(connection, user, courseId).as(MessageResponse("Course participant authorized."))

object AuthorizeCourseParticipantAPIMessage:
  val inputDecoder: Decoder[AuthorizeCourseParticipantAPIMessage] = deriveDecoder[AuthorizeCourseParticipantAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[AuthorizeCourseParticipantAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "AuthorizeCourseParticipantAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )

  private def authorize(connection: Connection, user: UserProfile, courseId: String): IO[Unit] =
    user.role match
      case UserRole.Admin => IO.unit
      case UserRole.Student =>
        CourseTable.isEnrolledCourseParticipant(connection, user.id, courseId).flatMap { enrolled =>
          if enrolled then IO.unit
          else IO.raiseError(new IllegalArgumentException("Only enrolled students can join this course discussion."))
        }
      case UserRole.Analyst =>
        IO.raiseError(new IllegalArgumentException("Data analysts do not participate in course discussions."))
      case UserRole.Teacher | UserRole.Assistant =>
        CourseTable.findCourseTeachingMembers(connection, courseId).flatMap {
          case Some((teacherId, assistants)) if teacherId == user.id || assistants.contains(user.id) => IO.unit
          case Some(_) => IO.raiseError(new IllegalArgumentException("Only course teachers and assistants can join this discussion."))
          case None => IO.raiseError(new IllegalArgumentException("Course does not exist."))
        }

  given Decoder[AuthorizeCourseParticipantAPIMessage] = inputDecoder
  given Encoder[AuthorizeCourseParticipantAPIMessage] = deriveEncoder[AuthorizeCourseParticipantAPIMessage]
