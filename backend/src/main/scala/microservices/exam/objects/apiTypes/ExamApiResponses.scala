// 文件说明：定义考试评定域期次与考试接口响应类型，用于前后端 API 返回值约束。
package microservices.exam.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.exam.objects.*

final case class TrainingCohortMutationResponse(
  message: String,
  cohort: TrainingCohort
)

object TrainingCohortMutationResponse:
  given Decoder[TrainingCohortMutationResponse] = deriveDecoder[TrainingCohortMutationResponse]
  given Encoder[TrainingCohortMutationResponse] = deriveEncoder[TrainingCohortMutationResponse]

final case class TrainingCohortListResponse(
  message: String,
  cohorts: List[TrainingCohort]
)

object TrainingCohortListResponse:
  given Decoder[TrainingCohortListResponse] = deriveDecoder[TrainingCohortListResponse]
  given Encoder[TrainingCohortListResponse] = deriveEncoder[TrainingCohortListResponse]

final case class ExamMutationResponse(
  message: String,
  exam: Exam
)

object ExamMutationResponse:
  given Decoder[ExamMutationResponse] = deriveDecoder[ExamMutationResponse]
  given Encoder[ExamMutationResponse] = deriveEncoder[ExamMutationResponse]

final case class ExamListResponse(
  message: String,
  exams: List[Exam],
  cohorts: List[TrainingCohort]
)

object ExamListResponse:
  given Decoder[ExamListResponse] = deriveDecoder[ExamListResponse]
  given Encoder[ExamListResponse] = deriveEncoder[ExamListResponse]

final case class StudentExamResultResponse(
  message: String,
  exam: Exam,
  cohortName: String,
  sheet: Option[AnswerSheet],
  scores: List[QuestionScoreEntry],
  argues: List[ArgueTicket],
  analysis: Option[ExamAnalysis],
  classSummary: ExamClassSummary
)

object StudentExamResultResponse:
  given Decoder[StudentExamResultResponse] = deriveDecoder[StudentExamResultResponse]
  given Encoder[StudentExamResultResponse] = deriveEncoder[StudentExamResultResponse]
