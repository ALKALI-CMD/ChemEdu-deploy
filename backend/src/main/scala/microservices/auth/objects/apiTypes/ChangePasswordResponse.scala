// 文件说明：定义认证修改密码接口响应类型，用于前后端 API 返回值约束。
package microservices.auth.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class ChangePasswordResponse(
  message: String
)

object ChangePasswordResponse:
  given Encoder[ChangePasswordResponse] = deriveEncoder[ChangePasswordResponse]
  given Decoder[ChangePasswordResponse] = deriveDecoder[ChangePasswordResponse]
