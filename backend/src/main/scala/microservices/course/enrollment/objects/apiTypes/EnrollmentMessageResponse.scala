// 文件说明：定义课程报名报名消息接口响应类型，用于前后端 API 返回值约束。
package microservices.course.enrollment.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class EnrollmentMessageResponse(message: String)

object EnrollmentMessageResponse:
  given Encoder[EnrollmentMessageResponse] = deriveEncoder[EnrollmentMessageResponse]
  given Decoder[EnrollmentMessageResponse] = deriveDecoder[EnrollmentMessageResponse]
