// 文件说明：定义课程目录课程状态领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}

enum CourseStatus(val entryName: String):
  case Published extends CourseStatus("published")
  case Draft extends CourseStatus("draft")
  case Archived extends CourseStatus("archived")

object CourseStatus:
  def toString(value: CourseStatus): String =
    value.entryName

  def fromString(value: String): Option[CourseStatus] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[CourseStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[CourseStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown CourseStatus: $value")
  )
