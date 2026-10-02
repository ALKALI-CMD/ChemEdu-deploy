// 文件说明：定义学习课程进度Stats领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class CourseProgressStats(
  courseId: String,
  completedLessons: Int,
  totalLessons: Int,
  studyMinutes: Int,
  completionRate: Int
)

object CourseProgressStats:
  given Encoder[CourseProgressStats] = deriveEncoder[CourseProgressStats]
  given Decoder[CourseProgressStats] = deriveDecoder[CourseProgressStats]
