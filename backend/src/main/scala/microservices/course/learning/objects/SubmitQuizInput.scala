// 文件说明：定义学习提交测验领域数据类型，用于业务流程和接口传输。
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

final case class SubmitQuizInput(
  quizId: String,
  objectiveAnswers: List[QuizOption],
  subjectiveAnswer: Option[String],
  fillBlankAnswers: List[String],
  answerRecords: List[QuizAnswerRecord]
)

object SubmitQuizInput:
  given Decoder[SubmitQuizInput] = deriveDecoder[SubmitQuizInput]
  given Encoder[SubmitQuizInput] = deriveEncoder[SubmitQuizInput]
