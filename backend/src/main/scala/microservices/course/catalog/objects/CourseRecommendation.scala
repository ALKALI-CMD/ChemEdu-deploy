// 文件说明：定义课程目录课程Recommendation领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class CourseRecommendation(
  courseId: String,
  reason: String,
  score: Double,
  recommendationType: String
)

object CourseRecommendation:
  given Encoder[CourseRecommendation] = deriveEncoder[CourseRecommendation]
  given Decoder[CourseRecommendation] = deriveDecoder[CourseRecommendation]
