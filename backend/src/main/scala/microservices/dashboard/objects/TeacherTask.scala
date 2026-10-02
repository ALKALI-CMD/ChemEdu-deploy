// 文件说明：定义看板教师Task领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class TeacherTask(
  id: String,
  title: String,
  assignee: String,
  status: TeacherTaskStatus
)

object TeacherTask:
  given Encoder[TeacherTask] = deriveEncoder[TeacherTask]
  given Decoder[TeacherTask] = deriveDecoder[TeacherTask]
