// 文件说明：定义认证会话Token领域数据类型，用于业务流程和接口传输。
package microservices.auth.objects

import io.circe.{Decoder, Encoder}

final case class SessionToken(value: String)

object SessionToken:
  given Encoder[SessionToken] = Encoder.encodeString.contramap(_.value)
  given Decoder[SessionToken] = Decoder.decodeString.map(SessionToken(_))
