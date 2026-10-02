// 文件说明：定义课程讨论解析平台举报领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.auth.objects.*
import microservices.admin.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

final case class ResolvePlatformReportData(
  reportId: String,
  status: String,
  resolutionNote: Option[String]
)

object ResolvePlatformReportData:
  given Decoder[ResolvePlatformReportData] = deriveDecoder[ResolvePlatformReportData]
  given Encoder[ResolvePlatformReportData] = deriveEncoder[ResolvePlatformReportData]
