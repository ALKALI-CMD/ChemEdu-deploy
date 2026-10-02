// 文件说明：定义学习成绩册Entry领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class GradebookEntry(
  courseId: String,
  courseTitle: String,
  assignmentAverage: Double,
  quizAverage: Double,
  progressScore: Double,
  totalScore: Double,
  assignmentWeight: Int,
  quizWeight: Int,
  progressWeight: Int,
  completedTaskRate: String
)

object GradebookEntry:
  given Encoder[GradebookEntry] = deriveEncoder[GradebookEntry]
  given Decoder[GradebookEntry] = deriveDecoder[GradebookEntry]
