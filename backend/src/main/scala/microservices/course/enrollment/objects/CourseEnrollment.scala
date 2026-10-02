// 文件说明：定义课程报名课程报名领域数据类型，用于业务流程和接口传输。
package microservices.course.enrollment.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class CourseEnrollment(
  userId: String,
  courseId: String,
  enrolledAt: String,
  status: String
)

object CourseEnrollment:
  given Encoder[CourseEnrollment] = deriveEncoder[CourseEnrollment]
  given Decoder[CourseEnrollment] = deriveDecoder[CourseEnrollment]
