// 文件说明：定义课程评价提交课程评价/批改领域数据类型，用于业务流程和接口传输。
package microservices.course.review.objects

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

final case class SubmitCourseReviewData(
  courseId: String,
  rating: Int,
  content: String
)

object SubmitCourseReviewData:
  given Decoder[SubmitCourseReviewData] = deriveDecoder[SubmitCourseReviewData]
  given Encoder[SubmitCourseReviewData] = deriveEncoder[SubmitCourseReviewData]
