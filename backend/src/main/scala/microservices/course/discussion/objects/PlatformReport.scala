// 文件说明：定义课程讨论平台举报领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.course.discussion.objects.*

final case class PlatformReport(
  id: String,
  reporterId: String,
  reporterName: String,
  targetType: String,
  targetId: String,
  targetLabel: String,
  reason: String,
  detail: Option[String],
  status: String,
  createdAt: String,
  resolvedBy: Option[String],
  resolvedAt: Option[String],
  resolutionNote: Option[String]
)

object PlatformReport:
  given Encoder[PlatformReport] = deriveEncoder[PlatformReport]
  given Decoder[PlatformReport] = deriveDecoder[PlatformReport]

