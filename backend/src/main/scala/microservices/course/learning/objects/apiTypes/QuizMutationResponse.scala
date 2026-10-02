// 文件说明：定义学习测验变更接口响应类型，用于前后端 API 返回值约束。
package microservices.course.learning.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.admin.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*

final case class QuizMutationResponse(
  message: String,
  quiz: Quiz
)

object QuizMutationResponse:
  given Decoder[QuizMutationResponse] = deriveDecoder[QuizMutationResponse]
  given Encoder[QuizMutationResponse] = deriveEncoder[QuizMutationResponse]
