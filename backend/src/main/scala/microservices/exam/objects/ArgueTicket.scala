// 文件说明：定义考试评定域争分工单领域数据类型，用于学生对判分结果提出异议。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 争分工单：学生对某道题的判分提出异议，由教研老师在窗口期内复核处理。 */
final case class ArgueTicket(
  id: String,
  examId: String,
  sheetId: String,
  studentId: String,
  studentName: String,
  questionId: String,
  questionTitle: String,
  reason: String,
  status: String,
  response: String,
  handledByName: Option[String],
  createdAt: String,
  resolvedAt: Option[String]
)

object ArgueTicket:
  given Decoder[ArgueTicket] = deriveDecoder[ArgueTicket]
  given Encoder[ArgueTicket] = deriveEncoder[ArgueTicket]
