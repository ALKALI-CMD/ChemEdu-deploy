// 文件说明：定义考试评定域考试实体领域数据类型，用于考试窗口与试卷管理。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 考试：归属于某个培训期次的考试窗口，包含试卷题目与答题卡改题区域定义。 */
final case class Exam(
  id: String,
  cohortId: String,
  name: String,
  description: String,
  scheduledStart: String,
  scheduledEnd: String,
  argueHours: Int,
  argueDeadline: Option[String],
  status: String,
  questions: List[ExamQuestion],
  gradingRegions: Map[String, GradingRegion],
  sheetTemplateImage: Option[String],
  createdBy: String,
  createdAt: String,
  releasedAt: Option[String]
)

object Exam:
  given Decoder[Exam] = deriveDecoder[Exam]
  given Encoder[Exam] = deriveEncoder[Exam]
