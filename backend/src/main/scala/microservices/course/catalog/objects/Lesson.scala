// 文件说明：定义课程目录课时领域数据类型，用于业务流程和接口传输。
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

final case class Lesson(
  id: String,
  title: String,
  duration: String,
  `type`: LessonType,
  completed: Boolean,
  contentBlocks: List[LessonContentBlock],
  resourceAttachments: List[AssignmentAttachment],
  videoUrl: Option[String],
  documentUrl: Option[String],
  unlockAfterLessonId: Option[String],
  isLocked: Boolean,
  requiredStudyMinutes: Int,
  studyRecord: Option[LessonStudyRecord]
)

object Lesson:
  given Encoder[Lesson] = deriveEncoder[Lesson]
  given Decoder[Lesson] = deriveDecoder[Lesson]

