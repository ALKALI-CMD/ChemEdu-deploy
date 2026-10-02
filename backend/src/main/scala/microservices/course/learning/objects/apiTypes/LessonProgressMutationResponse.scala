// 文件说明：定义学习课时进度变更接口响应类型，用于前后端 API 返回值约束。
package microservices.course.learning.objects.apiTypes

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

final case class LessonProgressMutationResponse(
  message: String,
  lessonId: String,
  status: LessonProgressStatus,
  studyMinutes: Int,
  lastPositionSeconds: Int,
  completedPreviewResourceIds: List[String],
  playbackRate: Double
)

object LessonProgressMutationResponse:
  given Decoder[LessonProgressMutationResponse] = deriveDecoder[LessonProgressMutationResponse]
  given Encoder[LessonProgressMutationResponse] = deriveEncoder[LessonProgressMutationResponse]
