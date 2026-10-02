// 文件说明：定义考试评定域阅卷与争分接口响应类型，用于前后端 API 返回值约束。
package microservices.exam.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.exam.objects.*

final case class AnswerSheetMutationResponse(
  message: String,
  sheet: AnswerSheet
)

object AnswerSheetMutationResponse:
  given Decoder[AnswerSheetMutationResponse] = deriveDecoder[AnswerSheetMutationResponse]
  given Encoder[AnswerSheetMutationResponse] = deriveEncoder[AnswerSheetMutationResponse]

final case class AnswerSheetListResponse(
  message: String,
  sheets: List[AnswerSheet],
  scores: List[QuestionScoreEntry]
)

object AnswerSheetListResponse:
  given Decoder[AnswerSheetListResponse] = deriveDecoder[AnswerSheetListResponse]
  given Encoder[AnswerSheetListResponse] = deriveEncoder[AnswerSheetListResponse]

final case class QuestionScoreMutationResponse(
  message: String,
  sheet: AnswerSheet,
  scores: List[QuestionScoreEntry]
)

object QuestionScoreMutationResponse:
  given Decoder[QuestionScoreMutationResponse] = deriveDecoder[QuestionScoreMutationResponse]
  given Encoder[QuestionScoreMutationResponse] = deriveEncoder[QuestionScoreMutationResponse]

final case class ScoreboardResponse(
  message: String,
  exam: Exam,
  rows: List[ScoreboardRow]
)

object ScoreboardResponse:
  given Decoder[ScoreboardResponse] = deriveDecoder[ScoreboardResponse]
  given Encoder[ScoreboardResponse] = deriveEncoder[ScoreboardResponse]

final case class ArgueMutationResponse(
  message: String,
  ticket: ArgueTicket
)

object ArgueMutationResponse:
  given Decoder[ArgueMutationResponse] = deriveDecoder[ArgueMutationResponse]
  given Encoder[ArgueMutationResponse] = deriveEncoder[ArgueMutationResponse]

final case class ArgueListResponse(
  message: String,
  tickets: List[ArgueTicket]
)

object ArgueListResponse:
  given Decoder[ArgueListResponse] = deriveDecoder[ArgueListResponse]
  given Encoder[ArgueListResponse] = deriveEncoder[ArgueListResponse]
