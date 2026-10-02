// 文件说明：定义学习测验状态领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}

enum QuizStatus(val entryName: String):
  case Upcoming extends QuizStatus("upcoming")
  case Ongoing extends QuizStatus("ongoing")
  case Finished extends QuizStatus("finished")

object QuizStatus:
  def toString(value: QuizStatus): String =
    value.entryName

  def fromString(value: String): Option[QuizStatus] =
    value.trim.toLowerCase match
      case "upcoming" => Some(Upcoming)
      case "ongoing" => Some(Ongoing)
      // Historical compatibility: older quiz results may store "completed".
      case "finished" | "completed" => Some(Finished)
      case _ => None
  given Encoder[QuizStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[QuizStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown QuizStatus: $value")
  )
