// 文件说明：定义认证用户Profile变更接口响应类型，用于前后端 API 返回值约束。
package microservices.auth.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.UserProfile

final case class UserProfileMutationResponse(
  message: String,
  user: UserProfile
)

object UserProfileMutationResponse:
  given Encoder[UserProfileMutationResponse] = deriveEncoder[UserProfileMutationResponse]
  given Decoder[UserProfileMutationResponse] = deriveDecoder[UserProfileMutationResponse]
