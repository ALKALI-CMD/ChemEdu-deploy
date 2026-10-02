// 文件说明：定义系统示例错误领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class ErrorResponse(message: String)

object ErrorResponse:
  given Encoder[ErrorResponse] = deriveEncoder[ErrorResponse]
  given Decoder[ErrorResponse] = deriveDecoder[ErrorResponse]
