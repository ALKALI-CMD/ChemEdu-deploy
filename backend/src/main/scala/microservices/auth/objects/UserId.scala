// 文件说明：定义认证用户Id领域数据类型，用于业务流程和接口传输。
package microservices.auth.objects

import io.circe.{Decoder, Encoder}

final case class UserId(value: String)

object UserId:
  given Encoder[UserId] = Encoder.encodeString.contramap(_.value)
  given Decoder[UserId] = Decoder.decodeString.map(UserId(_))
