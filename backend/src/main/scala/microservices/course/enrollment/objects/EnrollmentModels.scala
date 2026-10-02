// 文件说明：定义课程报名报名Models领域数据类型，用于业务流程和接口传输。
package microservices.course.enrollment.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class EnrollCourseData(
  courseId: String,
  inviteCode: Option[String],
  paymentMethod: Option[String]
)

object EnrollCourseData:
  given Decoder[EnrollCourseData] = deriveDecoder[EnrollCourseData]
  given Encoder[EnrollCourseData] = deriveEncoder[EnrollCourseData]
