// 文件说明：定义看板题目热点领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class QuestionHotspot(
  courseId: String,
  courseTitle: String,
  quizTitle: String,
  questionId: String,
  questionPrompt: String,
  questionType: String,
  wrongCount: Int,
  attemptCount: Int,
  wrongRate: Int
)

object QuestionHotspot:
  given Encoder[QuestionHotspot] = deriveEncoder[QuestionHotspot]
  given Decoder[QuestionHotspot] = deriveDecoder[QuestionHotspot]
