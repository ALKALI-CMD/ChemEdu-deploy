// 文件说明：定义课程目录课时内容Block领域数据类型，用于业务流程和接口传输。
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

final case class LessonContentBlock(
  id: String,
  contentType: LessonContentType,
  title: String,
  content: String
)

object LessonContentBlock:
  given Encoder[LessonContentBlock] = deriveEncoder[LessonContentBlock]
  given Decoder[LessonContentBlock] = deriveDecoder[LessonContentBlock]
