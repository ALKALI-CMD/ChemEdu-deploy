// 文件说明：定义课程评价课程评价/批改Entity领域数据类型，用于业务流程和接口传输。
package microservices.course.review.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class CourseReview(
  id: String,
  courseId: String,
  userId: String,
  author: String,
  rating: Int,
  content: String,
  createdAt: String,
  updatedAt: Option[String]
)

object CourseReview:
  given Encoder[CourseReview] = deriveEncoder[CourseReview]
  given Decoder[CourseReview] = deriveDecoder[CourseReview]

