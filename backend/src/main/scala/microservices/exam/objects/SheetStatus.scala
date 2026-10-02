// 文件说明：定义考试评定域答题卡状态枚举，用于阅卷进度跟踪。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}

enum SheetStatus(val entryName: String):
  case Pending extends SheetStatus("pending")
  case Graded extends SheetStatus("graded")

object SheetStatus:
  def toString(value: SheetStatus): String =
    value.entryName

  def fromString(value: String): Option[SheetStatus] =
    values.find(_.entryName == value.trim.toLowerCase)

  given Encoder[SheetStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[SheetStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown SheetStatus: $value")
  )
