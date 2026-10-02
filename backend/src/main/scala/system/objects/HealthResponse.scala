// 文件说明：定义系统示例健康检查领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class HealthResponse(status: String, service: String)

object HealthResponse:
  given Encoder[HealthResponse] = deriveEncoder[HealthResponse]
  given Decoder[HealthResponse] = deriveDecoder[HealthResponse]
