// 文件说明：后端认证接口实现，用于处理修改密码请求并返回类型安全响应。
package microservices.auth.api

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
import microservices.auth.objects.{createPasswordHash, verifyPassword, UserId}
import microservices.auth.objects.apiTypes.ChangePasswordResponse
import microservices.auth.tables.UserTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ChangePasswordAPIMessage(
  sessionToken: String,
  currentPassword: String,
  newPassword: String
) extends ConnectionAPIMessage[ChangePasswordResponse]:
  override def plan(connection: Connection): IO[ChangePasswordResponse] =
    for
      currentUser <- RequireSessionUserAPIMessage(sessionToken).plan(connection)
      normalizedCurrentPassword <- IO.pure(currentPassword.trim)
      normalizedNewPassword <- IO.pure(newPassword.trim)
      _ <- ChangePasswordAPIMessage.ensureNonEmpty(normalizedCurrentPassword, "Current password cannot be empty.")
      _ <- ChangePasswordAPIMessage.ensureNonEmpty(normalizedNewPassword, "New password cannot be empty.")
      _ <- if normalizedCurrentPassword != normalizedNewPassword then IO.unit else IO.raiseError(new IllegalArgumentException("New password must be different from the current password."))
      _ <- ChangePasswordAPIMessage.validatePasswordStrength(normalizedNewPassword)
      credentialOption <- UserTable.findCredentialByEmail(connection, currentUser.email)
      credential <- IO.fromOption(credentialOption)(new IllegalArgumentException("Current password is incorrect."))
      passwordMatches <- verifyPassword(normalizedCurrentPassword, credential.passwordHash, credential.passwordSalt)
      _ <- if passwordMatches then IO.unit else IO.raiseError(new IllegalArgumentException("Current password is incorrect."))
      passwordCredential <- createPasswordHash(normalizedNewPassword)
      (passwordHash, passwordSalt) = passwordCredential
      _ <- UserTable.updatePassword(connection, UserId(currentUser.id), passwordHash, passwordSalt)
    yield ChangePasswordResponse("Password updated successfully.")

object ChangePasswordAPIMessage:
  val inputDecoder: Decoder[ChangePasswordAPIMessage] = deriveDecoder[ChangePasswordAPIMessage]
  val outputEncoder: Encoder[ChangePasswordResponse] = deriveEncoder[ChangePasswordResponse]
  val schema: ConnectionApiMessageSchema[ChangePasswordAPIMessage, ChangePasswordResponse] = ConnectionApiMessageSchema(
    name = "ChangePasswordAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[ChangePasswordAPIMessage] = inputDecoder
  given Encoder[ChangePasswordAPIMessage] = deriveEncoder[ChangePasswordAPIMessage]

  private def ensureNonEmpty(value: String, message: String): IO[Unit] =
    if value.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException(message))

  private def validatePasswordStrength(password: String): IO[Unit] =
    if password.length >= 6 then IO.unit
    else IO.raiseError(new IllegalArgumentException("Password must be at least 6 characters long."))
