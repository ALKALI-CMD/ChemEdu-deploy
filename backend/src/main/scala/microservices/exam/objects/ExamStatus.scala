// 文件说明：定义考试评定域考试状态枚举，用于考试窗口生命周期流转。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}

enum ExamStatus(val entryName: String):
  case Draft extends ExamStatus("draft")
  case Published extends ExamStatus("published")
  case Grading extends ExamStatus("grading")
  case Released extends ExamStatus("released")
  case Archived extends ExamStatus("archived")

object ExamStatus:
  def toString(value: ExamStatus): String =
    value.entryName

  def fromString(value: String): Option[ExamStatus] =
    values.find(_.entryName == value.trim.toLowerCase)

  given Encoder[ExamStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[ExamStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown ExamStatus: $value")
  )
