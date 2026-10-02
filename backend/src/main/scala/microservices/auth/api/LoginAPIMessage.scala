// 文件说明：后端认证接口实现，用于处理登录请求并返回类型安全响应。
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
import microservices.auth.objects.{hashSessionToken, randomSessionToken, verifyPassword, UserId}
import microservices.auth.objects.apiTypes.AuthResponse
import microservices.auth.tables.{UserSessionTable, UserTable}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant

final case class LoginAPIMessage(
  email: String,
  password: String
) extends ConnectionAPIMessage[AuthResponse]:
  override def plan(connection: Connection): IO[AuthResponse] =
    for
      normalizedEmail <- IO.pure(email.trim.toLowerCase)
      _ <- LoginAPIMessage.validatePasswordStrength(password)
      credentialOption <- UserTable.findCredentialByEmail(connection, normalizedEmail)
      credential <- IO.fromOption(credentialOption)(new IllegalArgumentException("Invalid email or password."))
      passwordMatches <- verifyPassword(password, credential.passwordHash, credential.passwordSalt)
      _ <- if passwordMatches then IO.unit else IO.raiseError(new IllegalArgumentException("Invalid email or password."))
      token <- randomSessionToken()
      expiresAt <- IO.pure(LoginAPIMessage.sessionExpiryInstant())
      _ <- UserSessionTable.insert(connection, hashSessionToken(token), UserId(credential.user.id), expiresAt)
    yield AuthResponse.authenticated(token.value, credential.user, expiresAt.toString)

object LoginAPIMessage:
  val inputDecoder: Decoder[LoginAPIMessage] = deriveDecoder[LoginAPIMessage]
  val outputEncoder: Encoder[AuthResponse] = deriveEncoder[AuthResponse]
  val schema: ConnectionApiMessageSchema[LoginAPIMessage, AuthResponse] = ConnectionApiMessageSchema(
    name = "LoginAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[LoginAPIMessage] = inputDecoder
  given Encoder[LoginAPIMessage] = deriveEncoder[LoginAPIMessage]

  private def validatePasswordStrength(password: String): IO[Unit] =
    if password.length >= 6 then IO.unit
    else IO.raiseError(new IllegalArgumentException("Password must be at least 6 characters long."))

  private[auth] def sessionExpiryInstant(): Instant =
    Instant.now().plusSeconds(7L * 24L * 60L * 60L)
