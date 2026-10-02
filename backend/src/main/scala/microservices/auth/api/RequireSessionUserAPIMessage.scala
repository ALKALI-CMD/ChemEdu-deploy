// 文件说明：后端认证接口实现，用于处理校验会话用户请求并返回类型安全响应。
package microservices.auth.api

import cats.effect.IO
import microservices.auth.objects.{hashSessionToken, SessionToken, UserProfile}
import microservices.auth.tables.UserSessionTable
import system.api.ConnectionAPIMessage

import java.sql.Connection

final case class RequireSessionUserAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[UserProfile]:
  override def plan(connection: Connection): IO[UserProfile] =
    UserSessionTable.findUserByTokenHash(connection, hashSessionToken(SessionToken(sessionToken))).flatMap {
      case Some(user) => IO.pure(user)
      case None => IO.raiseError(new IllegalArgumentException("Session has expired. Please log in again."))
    }
