// 文件说明：定义看板看板学习接口响应类型，用于前后端 API 返回值约束。
package microservices.dashboard.objects.apiTypes

import microservices.dashboard.objects.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.objects.AnalyticsSnapshot
import microservices.course.learning.objects.{Assignment, CourseProgressStats, GradebookEntry, Quiz}

final case class DashboardLearningResponse(
  assignments: List[Assignment],
  quizzes: List[Quiz],
  analytics: AnalyticsSnapshot,
  gradebook: List[GradebookEntry],
  courseProgress: List[CourseProgressStats]
)

object DashboardLearningResponse:
  given Encoder[DashboardLearningResponse] = deriveEncoder[DashboardLearningResponse]
  given Decoder[DashboardLearningResponse] = deriveDecoder[DashboardLearningResponse]
