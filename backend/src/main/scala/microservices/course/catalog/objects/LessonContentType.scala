// 文件说明：定义课程目录课时内容类型领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}

enum LessonContentType(val entryName: String):
  case Video extends LessonContentType("video")
  case Slides extends LessonContentType("slides")
  case RichText extends LessonContentType("rich_text")
  case Download extends LessonContentType("download")

object LessonContentType:
  def toString(value: LessonContentType): String =
    value.entryName

  def fromString(value: String): Option[LessonContentType] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[LessonContentType] = Encoder.encodeString.contramap(toString)
  given Decoder[LessonContentType] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown LessonContentType: $value")
  )
