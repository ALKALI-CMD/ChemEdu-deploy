// 文件说明：定义看板课程成绩Distribution领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class CourseGradeDistribution(
  courseId: String,
  courseTitle: String,
  studentCount: Int,
  averageScore: Double,
  passRate: String,
  excellentRate: String,
  failCount: Int,
  passCount: Int,
  goodCount: Int,
  excellentCount: Int
)

object CourseGradeDistribution:
  given Encoder[CourseGradeDistribution] = deriveEncoder[CourseGradeDistribution]
  given Decoder[CourseGradeDistribution] = deriveDecoder[CourseGradeDistribution]
