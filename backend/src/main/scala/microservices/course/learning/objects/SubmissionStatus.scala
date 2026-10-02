// 文件说明：定义学习Submission状态领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}

enum SubmissionStatus(val entryName: String):
  case Pending extends SubmissionStatus("pending")
  case Submitted extends SubmissionStatus("submitted")
  case Reviewed extends SubmissionStatus("reviewed")

object SubmissionStatus:
  def toString(value: SubmissionStatus): String =
    value.entryName

  def fromString(value: String): Option[SubmissionStatus] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[SubmissionStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[SubmissionStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown SubmissionStatus: $value")
  )
