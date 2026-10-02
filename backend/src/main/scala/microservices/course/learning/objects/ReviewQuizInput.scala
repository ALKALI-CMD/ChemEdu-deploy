// 文件说明：定义学习评价/批改测验领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

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

final case class ReviewQuizInput(
  quizId: String,
  subjectiveScore: Int,
  feedback: Option[String]
)

object ReviewQuizInput:
  given Decoder[ReviewQuizInput] = deriveDecoder[ReviewQuizInput]
  given Encoder[ReviewQuizInput] = deriveEncoder[ReviewQuizInput]
