// 文件说明：定义考试评定域培训期次领域数据类型，用于业务流程和接口传输。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 培训期次：清北营的一期课程（如“2026 春季高端 VIP 班”），期内安排多个考试窗口。 */
final case class TrainingCohort(
  id: String,
  name: String,
  season: String,
  startDate: String,
  endDate: String,
  description: String,
  memberIds: List[String],
  status: String,
  createdBy: Option[String],
  createdAt: String
)

object TrainingCohort:
  given Decoder[TrainingCohort] = deriveDecoder[TrainingCohort]
  given Encoder[TrainingCohort] = deriveEncoder[TrainingCohort]
