// 文件说明：定义看板课时Bottleneck领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class LessonBottleneck(
  courseId: String,
  courseTitle: String,
  moduleTitle: String,
  lessonId: String,
  lessonTitle: String,
  completionRate: Int,
  completedStudentCount: Int,
  enrolledStudentCount: Int,
  averageStudyMinutes: Int,
  requiredStudyMinutes: Int
)

object LessonBottleneck:
  given Encoder[LessonBottleneck] = deriveEncoder[LessonBottleneck]
  given Decoder[LessonBottleneck] = deriveDecoder[LessonBottleneck]
