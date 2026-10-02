// 文件说明：定义学习测验Option领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}

enum QuizOption(val entryName: String):
  case A extends QuizOption("A")
  case B extends QuizOption("B")
  case C extends QuizOption("C")
  case D extends QuizOption("D")

object QuizOption:
  def toString(value: QuizOption): String =
    value.entryName

  def fromString(value: String): Option[QuizOption] =
    values.find(_.entryName.equalsIgnoreCase(value.trim))
  given Encoder[QuizOption] = Encoder.encodeString.contramap(toString)
  given Decoder[QuizOption] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown QuizOption: $value")
  )
