// 文件说明：定义考试评定域智能分析、统计与报名线索接口响应类型，用于前后端 API 返回值约束。
package microservices.exam.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.exam.objects.*

final case class ExamAnalysisMutationResponse(
  message: String,
  analysis: ExamAnalysis
)

object ExamAnalysisMutationResponse:
  given Decoder[ExamAnalysisMutationResponse] = deriveDecoder[ExamAnalysisMutationResponse]
  given Encoder[ExamAnalysisMutationResponse] = deriveEncoder[ExamAnalysisMutationResponse]

final case class ExamStatisticsResponse(
  message: String,
  summaries: List[ExamStatSummary],
  cohortTrends: List[CohortTrendRow]
)

object ExamStatisticsResponse:
  given Decoder[ExamStatisticsResponse] = deriveDecoder[ExamStatisticsResponse]
  given Encoder[ExamStatisticsResponse] = deriveEncoder[ExamStatisticsResponse]

final case class EnrollmentLeadMutationResponse(
  message: String,
  lead: EnrollmentLead
)

object EnrollmentLeadMutationResponse:
  given Decoder[EnrollmentLeadMutationResponse] = deriveDecoder[EnrollmentLeadMutationResponse]
  given Encoder[EnrollmentLeadMutationResponse] = deriveEncoder[EnrollmentLeadMutationResponse]

final case class EnrollmentLeadListResponse(
  message: String,
  leads: List[EnrollmentLead]
)

object EnrollmentLeadListResponse:
  given Decoder[EnrollmentLeadListResponse] = deriveDecoder[EnrollmentLeadListResponse]
  given Encoder[EnrollmentLeadListResponse] = deriveEncoder[EnrollmentLeadListResponse]
