// 文件说明：定义学习测验题目领域数据类型，用于业务流程和接口传输。
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

final case class QuizQuestion(
  id: String,
  questionType: QuizQuestionType,
  prompt: String,
  options: List[QuizQuestionOption],
  correctAnswers: List[String],
  explanation: Option[String],
  points: Int
)

object QuizQuestion:
  given Encoder[QuizQuestion] = deriveEncoder[QuizQuestion]
  given Decoder[QuizQuestion] = (cursor: HCursor) =>
    for
      id <- cursor.get[String]("id")
      questionType <- cursor.get[QuizQuestionType]("questionType")
      prompt <- cursor.get[String]("prompt")
      options <- cursor.getOrElse[List[QuizQuestionOption]]("options")(Nil)
      correctAnswers <- cursor.getOrElse[List[String]]("correctAnswers")(Nil)
      explanation <- cursor.get[Option[String]]("explanation")
      points <- cursor.getOrElse[Int]("points")(
        questionType match
          case QuizQuestionType.Subjective => 20
          case QuizQuestionType.FillBlank => 12
          case QuizQuestionType.MultipleChoice => 15
          case _ => 10
      )
    yield QuizQuestion(
      id = id,
      questionType = questionType,
      prompt = prompt,
      options = options,
      correctAnswers = correctAnswers,
      explanation = explanation,
      points = points
    )
