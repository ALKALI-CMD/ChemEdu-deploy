// 文件说明：定义考试评定域争分工单状态枚举，用于学生成绩申诉流转。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}

enum ArgueStatus(val entryName: String):
  case Open extends ArgueStatus("open")
  case Resolved extends ArgueStatus("resolved")
  case Rejected extends ArgueStatus("rejected")

object ArgueStatus:
  def toString(value: ArgueStatus): String =
    value.entryName

  def fromString(value: String): Option[ArgueStatus] =
    values.find(_.entryName == value.trim.toLowerCase)

  given Encoder[ArgueStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[ArgueStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown ArgueStatus: $value")
  )
