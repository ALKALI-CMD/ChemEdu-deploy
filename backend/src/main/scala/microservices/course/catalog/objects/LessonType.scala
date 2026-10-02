// 文件说明：定义课程目录课时类型领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}

enum LessonType(val entryName: String):
  case Video extends LessonType("video")
  case Document extends LessonType("document")
  case Quiz extends LessonType("quiz")
  case Live extends LessonType("live")

object LessonType:
  def toString(value: LessonType): String =
    value.entryName

  def fromString(value: String): Option[LessonType] =
    value.trim.toLowerCase match
      case "video" => Some(Video)
      // Historical compatibility: older payloads may still send "doc".
      case "document" | "doc" => Some(Document)
      case "quiz" => Some(Quiz)
      case "live" => Some(Live)
      case _ => None
  given Encoder[LessonType] = Encoder.encodeString.contramap(toString)
  given Decoder[LessonType] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown LessonType: $value")
  )
