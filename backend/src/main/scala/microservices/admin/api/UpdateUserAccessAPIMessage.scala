// 文件说明：后端管理端接口实现，用于处理更新用户访问权限请求并返回类型安全响应。
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
import microservices.admin.tables.UserAccessTable
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse, MessageResponse}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.catalog.objects.CourseAuditStatus
import microservices.auth.objects.{UserProfile, UserRole}

import java.sql.Connection

final case class UpdateUserAccessAPIMessage(
  sessionToken: String,
  userId: Option[String],
  role: UserRole,
  permissions: List[String]
) extends ConnectionAPIMessage[UserMutationResponse]:
  override def plan(connection: Connection): IO[UserMutationResponse] =
    UpdateUserAccessAPIMessage.schema.execute(this, connection)

object UpdateUserAccessAPIMessage:
  val inputDecoder: Decoder[UpdateUserAccessAPIMessage] = deriveDecoder[UpdateUserAccessAPIMessage]
  val outputEncoder: Encoder[UserMutationResponse] = deriveEncoder[UserMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateUserAccessAPIMessage, UserMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateUserAccessAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedUserId <- IO.fromOption(input.userId)(new IllegalArgumentException("input.userId is required for UpdateUserAccessAPIMessage"))
            adminUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            _ <- requireAdmin(adminUser)
            _ <- IO.raiseWhen(adminUser.id == resolvedUserId && input.role != UserRole.Admin)(
              new IllegalArgumentException("The current admin cannot remove their own admin role.")
            )
            _ <- UserAccessTable.updateAccess(connection, resolvedUserId, input.role, input.permissions)
            updatedUser <- UserAccessTable.findById(connection, resolvedUserId)
            user <- IO.fromOption(updatedUser)(new IllegalArgumentException("Target user does not exist."))
          yield UserMutationResponse(s"User ${user.name} access updated.", user)
  )
  def requireAdmin(user: UserProfile): IO[UserProfile] =
    if user.role == UserRole.Admin then IO.pure(user)
    else IO.raiseError(new IllegalArgumentException("Only admins can perform this action."))
  given Decoder[UpdateUserAccessAPIMessage] = inputDecoder
  given Encoder[UpdateUserAccessAPIMessage] = deriveEncoder[UpdateUserAccessAPIMessage]


