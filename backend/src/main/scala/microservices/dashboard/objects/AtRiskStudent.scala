// 文件说明：定义看板AtRisk学生领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class AtRiskStudent(
  userId: String,
  studentName: String,
  courseId: String,
  courseTitle: String,
  completionRate: Int,
  studyMinutes: Int,
  pendingAssignmentCount: Int,
  pendingQuizCount: Int,
  averageScore: Double,
  riskReasons: List[String]
)

object AtRiskStudent:
  given Encoder[AtRiskStudent] = deriveEncoder[AtRiskStudent]
  given Decoder[AtRiskStudent] = deriveDecoder[AtRiskStudent]
