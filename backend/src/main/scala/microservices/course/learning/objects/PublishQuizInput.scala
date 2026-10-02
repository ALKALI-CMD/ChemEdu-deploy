// 文件说明：定义学习发布测验领域数据类型，用于业务流程和接口传输。
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

final case class PublishQuizInput(
  courseId: String,
  title: String,
  durationMinutes: Int,
  objectiveQuestionCount: Int,
  subjectiveQuestionCount: Int,
  drawCount: Option[Int],
  shuffleQuestions: Boolean,
  shuffleOptions: Boolean,
  answerKeys: List[QuizOption],
  questionBank: List[QuizQuestion]
)

object PublishQuizInput:
  given Decoder[PublishQuizInput] = deriveDecoder[PublishQuizInput]
  given Encoder[PublishQuizInput] = deriveEncoder[PublishQuizInput]
