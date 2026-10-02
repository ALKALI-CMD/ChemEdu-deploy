// 文件说明：定义课程目录课程Module领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.learning.objects.{AssignmentAttachment, LessonStudyRecord}
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

final case class CourseModule(
  id: String,
  title: String,
  lessons: List[Lesson]
)

object CourseModule:
  given Encoder[CourseModule] = deriveEncoder[CourseModule]
  given Decoder[CourseModule] = deriveDecoder[CourseModule]
