// 文件说明：定义认证认证Users接口响应类型，用于前后端 API 返回值约束。
package microservices.auth.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.UserProfile

final case class AuthUsersResponse(
  users: List[UserProfile]
)

object AuthUsersResponse:
  given Encoder[AuthUsersResponse] = deriveEncoder[AuthUsersResponse]
  given Decoder[AuthUsersResponse] = deriveDecoder[AuthUsersResponse]
