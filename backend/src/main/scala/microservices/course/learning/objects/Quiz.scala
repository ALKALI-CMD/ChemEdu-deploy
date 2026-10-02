// 文件说明：定义学习测验领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder, HCursor}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
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

final case class Quiz(
  id: String,
  courseId: String,
  title: String,
  durationMinutes: Int,
  objectiveQuestionCount: Int,
  subjectiveQuestionCount: Int,
  drawCount: Option[Int],
  shuffleQuestions: Boolean,
  shuffleOptions: Boolean,
  status: QuizStatus,
  score: Option[Int],
  objectiveScore: Option[Int],
  subjectiveScore: Option[Int],
  subjectiveAnswer: Option[String],
  subjectiveFeedback: Option[String],
  reviewerName: Option[String],
  reviewedAt: Option[String],
  submittedAt: Option[String],
  questionBank: List[QuizQuestion],
  objectiveAnswerRecord: List[QuizAnswerRecord],
  wrongQuestionIds: List[String]
)

object Quiz:
  given Encoder[Quiz] = deriveEncoder[Quiz]
  given Decoder[Quiz] = deriveDecoder[Quiz]

