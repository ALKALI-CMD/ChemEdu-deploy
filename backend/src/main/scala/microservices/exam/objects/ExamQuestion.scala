// 文件说明：定义考试评定域试卷题目领域数据类型，用于判分与折合分计算。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 试卷题目：orderIndex 为题号，maxScore 为卷面满分，convertedScore 为折合满分。 */
final case class ExamQuestion(
  id: String,
  orderIndex: Int,
  title: String,
  topicTag: String,
  maxScore: Double,
  convertedScore: Double,
  referenceAnswer: String
)

object ExamQuestion:
  given Decoder[ExamQuestion] = deriveDecoder[ExamQuestion]
  given Encoder[ExamQuestion] = deriveEncoder[ExamQuestion]
