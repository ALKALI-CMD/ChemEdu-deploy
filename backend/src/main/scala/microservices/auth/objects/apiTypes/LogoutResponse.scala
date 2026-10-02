// 文件说明：定义认证退出登录接口响应类型，用于前后端 API 返回值约束。
package microservices.auth.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class LogoutResponse(
  message: String
)

object LogoutResponse:
  given Encoder[LogoutResponse] = deriveEncoder[LogoutResponse]
  given Decoder[LogoutResponse] = deriveDecoder[LogoutResponse]
