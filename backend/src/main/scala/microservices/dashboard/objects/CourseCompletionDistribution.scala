// 文件说明：定义看板课程完成度Distribution领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class CourseCompletionDistribution(
  courseId: String,
  courseTitle: String,
  excellentCount: Int,
  steadyCount: Int,
  warningCount: Int,
  stuckCount: Int,
  averageCompletionRate: Int
)

object CourseCompletionDistribution:
  given Encoder[CourseCompletionDistribution] = deriveEncoder[CourseCompletionDistribution]
  given Decoder[CourseCompletionDistribution] = deriveDecoder[CourseCompletionDistribution]
