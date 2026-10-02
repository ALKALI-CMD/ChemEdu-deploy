// 文件说明：定义课程评价课程评价/批改变更接口响应类型，用于前后端 API 返回值约束。
package microservices.course.review.objects.apiTypes

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

final case class CourseReviewMutationResponse(
  message: String,
  review: CourseReview
)

object CourseReviewMutationResponse:
  given Decoder[CourseReviewMutationResponse] = deriveDecoder[CourseReviewMutationResponse]
  given Encoder[CourseReviewMutationResponse] = deriveEncoder[CourseReviewMutationResponse]
