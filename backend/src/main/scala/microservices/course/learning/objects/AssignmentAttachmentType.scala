// 文件说明：定义学习作业附件类型领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}

enum AssignmentAttachmentType(val entryName: String):
  case Reference extends AssignmentAttachmentType("reference")
  case Submission extends AssignmentAttachmentType("submission")
  case Review extends AssignmentAttachmentType("review")

object AssignmentAttachmentType:
  def toString(value: AssignmentAttachmentType): String =
    value.entryName

  def fromString(value: String): Option[AssignmentAttachmentType] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[AssignmentAttachmentType] = Encoder.encodeString.contramap(toString)
  given Decoder[AssignmentAttachmentType] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown AssignmentAttachmentType: $value")
  )
