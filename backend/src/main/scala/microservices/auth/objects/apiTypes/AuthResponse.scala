// 文件说明：定义认证认证接口响应类型，用于前后端 API 返回值约束。
package microservices.auth.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.UserProfile

final case class AuthResponse(
  ok: Boolean,
  sessionToken: Option[String],
  user: Option[UserProfile],
  expiresAt: Option[String],
  message: Option[String]
)

object AuthResponse:
  def authenticated(sessionToken: String, user: UserProfile, expiresAt: String): AuthResponse =
    AuthResponse(
      ok = true,
      sessionToken = Some(sessionToken),
      user = Some(user),
      expiresAt = Some(expiresAt),
      message = None
    )

  given Encoder[AuthResponse] = deriveEncoder[AuthResponse]
  given Decoder[AuthResponse] = deriveDecoder[AuthResponse]
