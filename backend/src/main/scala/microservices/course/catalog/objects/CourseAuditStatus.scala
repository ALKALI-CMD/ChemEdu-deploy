// 文件说明：定义课程目录课程审核状态领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}

enum CourseAuditStatus(val entryName: String):
  case Pending extends CourseAuditStatus("pending")
  case Approved extends CourseAuditStatus("approved")
  case Rejected extends CourseAuditStatus("rejected")

object CourseAuditStatus:
  def toString(value: CourseAuditStatus): String =
    value.entryName

  def fromString(value: String): Option[CourseAuditStatus] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[CourseAuditStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[CourseAuditStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown CourseAuditStatus: $value")
  )
