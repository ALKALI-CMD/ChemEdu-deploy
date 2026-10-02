// 文件说明：定义看板班级成绩Distribution领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class ClassGradeDistribution(
  courseId: String,
  courseTitle: String,
  academicClassId: String,
  academicClassName: String,
  studentCount: Int,
  averageScore: Double,
  passRate: String,
  excellentRate: String,
  failCount: Int,
  passCount: Int,
  goodCount: Int,
  excellentCount: Int
)

object ClassGradeDistribution:
  given Encoder[ClassGradeDistribution] = deriveEncoder[ClassGradeDistribution]
  given Decoder[ClassGradeDistribution] = deriveDecoder[ClassGradeDistribution]
