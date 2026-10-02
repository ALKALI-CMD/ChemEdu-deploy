// 文件说明：定义学习测验题目类型领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}

enum QuizQuestionType(val entryName: String):
  case SingleChoice extends QuizQuestionType("single_choice")
  case MultipleChoice extends QuizQuestionType("multiple_choice")
  case TrueFalse extends QuizQuestionType("true_false")
  case FillBlank extends QuizQuestionType("fill_blank")
  case Subjective extends QuizQuestionType("subjective")

object QuizQuestionType:
  def toString(value: QuizQuestionType): String =
    value.entryName

  def fromString(value: String): Option[QuizQuestionType] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[QuizQuestionType] = Encoder.encodeString.contramap(toString)
  given Decoder[QuizQuestionType] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown QuizQuestionType: $value")
  )
