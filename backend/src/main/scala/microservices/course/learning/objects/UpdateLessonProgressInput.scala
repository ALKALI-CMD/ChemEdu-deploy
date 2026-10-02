// 文件说明：定义学习更新课时进度领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

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

final case class UpdateLessonProgressInput(
  lessonId: String,
  status: LessonProgressStatus,
  studyMinutes: Option[Int],
  lastPositionSeconds: Option[Int],
  completedPreviewResourceIds: Option[List[String]],
  playbackRate: Option[Double],
  eventType: Option[String]
)

object UpdateLessonProgressInput:
  given Decoder[UpdateLessonProgressInput] = deriveDecoder[UpdateLessonProgressInput]
  given Encoder[UpdateLessonProgressInput] = deriveEncoder[UpdateLessonProgressInput]

