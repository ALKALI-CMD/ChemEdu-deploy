// 文件说明：定义课程报名候补名单Entry领域数据类型，用于业务流程和接口传输。
package microservices.course.enrollment.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class WaitlistEntry(
  userId: String,
  courseId: String,
  queuedAt: String,
  position: Int
)

object WaitlistEntry:
  given Encoder[WaitlistEntry] = deriveEncoder[WaitlistEntry]
  given Decoder[WaitlistEntry] = deriveDecoder[WaitlistEntry]
