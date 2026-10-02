// 文件说明：定义考试评定域成绩册行领域数据类型，用于考试折合分排名。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 成绩册行：questionScores 为题目 id 到卷面得分的映射，rank 按折合分从高到低。 */
final case class ScoreboardRow(
  studentId: String,
  studentName: String,
  questionScores: Map[String, Double],
  rawTotal: Double,
  convertedTotal: Double,
  rank: Int
)

object ScoreboardRow:
  given Decoder[ScoreboardRow] = deriveDecoder[ScoreboardRow]
  given Encoder[ScoreboardRow] = deriveEncoder[ScoreboardRow]
