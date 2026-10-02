// 文件说明：定义管理端教学班级领域数据类型，用于业务流程和接口传输。
package microservices.admin.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.admin.objects.*
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*

final case class AcademicClass(
  id: String,
  majorId: String,
  grade: String,
  name: String,
  capacity: Int,
  studentIds: List[String]
)

object AcademicClass:
  given Encoder[AcademicClass] = deriveEncoder[AcademicClass]
  given Decoder[AcademicClass] = deriveDecoder[AcademicClass]
