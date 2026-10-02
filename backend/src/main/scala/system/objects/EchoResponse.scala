// 文件说明：定义系统示例回显领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class EchoResponse(message: String, transformed: Boolean)

object EchoResponse:
  given Encoder[EchoResponse] = deriveEncoder[EchoResponse]
  given Decoder[EchoResponse] = deriveDecoder[EchoResponse]
