// 文件说明：定义考试评定域答题卡领域数据类型，用于答题卡上传与阅卷。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 学生答题卡：imageDataUrl 为前端压缩后的答题卡图片；一份考试每位学生一张，覆盖上传。 */
final case class AnswerSheet(
  id: String,
  examId: String,
  studentId: String,
  studentName: String,
  imageDataUrl: String,
  status: String,
  rawTotal: Option[Double],
  convertedTotal: Option[Double],
  uploadedByName: String,
  uploadedAt: String,
  gradedAt: Option[String]
)

object AnswerSheet:
  given Decoder[AnswerSheet] = deriveDecoder[AnswerSheet]
  given Encoder[AnswerSheet] = deriveEncoder[AnswerSheet]
