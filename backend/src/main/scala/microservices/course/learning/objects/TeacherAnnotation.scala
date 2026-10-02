// 文件说明：定义学习教师Annotation领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder, HCursor}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
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

final case class TeacherAnnotation(
  id: String,
  author: String,
  body: String,
  createdAt: String
)

object TeacherAnnotation:
  given Encoder[TeacherAnnotation] = deriveEncoder[TeacherAnnotation]
  given Decoder[TeacherAnnotation] = deriveDecoder[TeacherAnnotation]
