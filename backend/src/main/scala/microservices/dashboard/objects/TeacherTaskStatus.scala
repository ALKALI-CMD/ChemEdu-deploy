// 文件说明：定义看板教师Task状态领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

enum TeacherTaskStatus(val entryName: String):
  case Pending extends TeacherTaskStatus("pending")
  case InProgress extends TeacherTaskStatus("in_progress")
  case Completed extends TeacherTaskStatus("completed")

object TeacherTaskStatus:
  def toString(value: TeacherTaskStatus): String =
    value.entryName

  def fromString(value: String): Option[TeacherTaskStatus] =
    value.trim.toLowerCase match
      case "pending" | "todo" => Some(Pending)
      case "in_progress" | "in-progress" => Some(InProgress)
      case "completed" | "done" => Some(Completed)
      case _ => None
  given Encoder[TeacherTaskStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[TeacherTaskStatus] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown TeacherTaskStatus: $value")
  )
