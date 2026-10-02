// 文件说明：定义学习课时进度状态领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}

enum LessonProgressStatus(val entryName: String):
  case Completed extends LessonProgressStatus("completed")
  case Incomplete extends LessonProgressStatus("incomplete")

object LessonProgressStatus:
  def toString(value: LessonProgressStatus): String =
    value.entryName

  def fromString(value: String): Option[LessonProgressStatus] =
    value.trim.toLowerCase match
      case "completed" => Some(Completed)
      case "incomplete" => Some(Incomplete)
      case _ => None
  given Encoder[LessonProgressStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[LessonProgressStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown LessonProgressStatus: $value")
  )
