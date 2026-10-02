// 文件说明：定义考试评定域单题判分记录领域数据类型，用于阅卷打分与折合分计算。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 单题判分记录：score 为卷面得分，convertedScore 为按题目折合比例换算后的得分。 */
final case class QuestionScoreEntry(
  id: String,
  examId: String,
  sheetId: String,
  questionId: String,
  score: Double,
  maxScore: Double,
  convertedScore: Double,
  comment: String,
  graderId: String,
  graderName: String,
  gradedAt: String,
  adjusted: Boolean
)

object QuestionScoreEntry:
  given Decoder[QuestionScoreEntry] = deriveDecoder[QuestionScoreEntry]
  given Encoder[QuestionScoreEntry] = deriveEncoder[QuestionScoreEntry]
