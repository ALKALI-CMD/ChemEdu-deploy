// 文件说明：定义课程目录学习PathRecommendation领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class LearningPathRecommendation(
  id: String,
  title: String,
  courseIds: List[String],
  reason: String,
  estimatedHours: Int
)

object LearningPathRecommendation:
  given Encoder[LearningPathRecommendation] = deriveEncoder[LearningPathRecommendation]
  given Decoder[LearningPathRecommendation] = deriveDecoder[LearningPathRecommendation]
