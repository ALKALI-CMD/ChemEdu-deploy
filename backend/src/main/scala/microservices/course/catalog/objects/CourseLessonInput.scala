// 文件说明：定义课程目录课程课时领域数据类型，用于业务流程和接口传输。
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

final case class CourseLessonInput(
  id: Option[String],
  title: String,
  duration: String,
  `type`: LessonType,
  completed: Boolean,
  contentBlocks: List[LessonContentBlock],
  resourceAttachments: List[AssignmentAttachment],
  videoUrl: Option[String],
  documentUrl: Option[String],
  unlockAfterLessonId: Option[String],
  requiredStudyMinutes: Int
)

object CourseLessonInput:
  given Decoder[CourseLessonInput] = deriveDecoder[CourseLessonInput]
  given Encoder[CourseLessonInput] = deriveEncoder[CourseLessonInput]

