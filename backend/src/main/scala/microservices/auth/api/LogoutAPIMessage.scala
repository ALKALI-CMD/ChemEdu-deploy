// 文件说明：后端认证接口实现，用于处理退出登录请求并返回类型安全响应。
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
import microservices.auth.objects.{hashSessionToken, SessionToken}
import microservices.auth.objects.apiTypes.LogoutResponse
import microservices.auth.tables.UserSessionTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class LogoutAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[LogoutResponse]:
  override def plan(connection: Connection): IO[LogoutResponse] =
    for
      normalizedSessionToken <- IO.pure(sessionToken.trim)
      _ <- LogoutAPIMessage.ensureNonEmpty(normalizedSessionToken, "Session token cannot be empty.")
      _ <- UserSessionTable.delete(connection, hashSessionToken(SessionToken(normalizedSessionToken)))
    yield LogoutResponse("Logged out successfully.")

object LogoutAPIMessage:
  val inputDecoder: Decoder[LogoutAPIMessage] = deriveDecoder[LogoutAPIMessage]
  val outputEncoder: Encoder[LogoutResponse] = deriveEncoder[LogoutResponse]
  val schema: ConnectionApiMessageSchema[LogoutAPIMessage, LogoutResponse] = ConnectionApiMessageSchema(
    name = "LogoutAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[LogoutAPIMessage] = inputDecoder
  given Encoder[LogoutAPIMessage] = deriveEncoder[LogoutAPIMessage]

  private def ensureNonEmpty(value: String, message: String): IO[Unit] =
    if value.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException(message))
