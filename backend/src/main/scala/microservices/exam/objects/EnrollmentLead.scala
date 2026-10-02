// 文件说明：定义官网报名线索领域数据类型，用于收集招生咨询信息。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 报名咨询线索：由官网公开表单提交，校长与教研老师在后台跟进。 */
final case class EnrollmentLead(
  id: String,
  studentName: String,
  contact: String,
  gradeLevel: String,
  targetStage: String,
  courseInterest: String,
  message: String,
  status: String,
  createdAt: String
)

object EnrollmentLead:
  given Decoder[EnrollmentLead] = deriveDecoder[EnrollmentLead]
  given Encoder[EnrollmentLead] = deriveEncoder[EnrollmentLead]
