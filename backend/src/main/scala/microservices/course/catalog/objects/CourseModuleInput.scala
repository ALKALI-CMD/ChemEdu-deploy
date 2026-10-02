// 文件说明：定义课程目录课程Module领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

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
import microservices.course.discussion.objects.*

final case class CourseModuleInput(
  id: Option[String],
  title: String,
  lessons: List[CourseLessonInput]
)

object CourseModuleInput:
  given Decoder[CourseModuleInput] = deriveDecoder[CourseModuleInput]
  given Encoder[CourseModuleInput] = deriveEncoder[CourseModuleInput]
