// 文件说明：定义看板学生课时进度Snapshot领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.learning.objects.{QuizQuestion, QuizStatus, SubmissionStatus}

final case class StudentLessonProgressSnapshot(
  courseId: String,
  studentId: String,
  lessonId: String,
  lessonTitle: String,
  moduleTitle: String,
  completed: Boolean,
  studyMinutes: Int,
  requiredStudyMinutes: Int
)

object StudentLessonProgressSnapshot:
  given Encoder[StudentLessonProgressSnapshot] = deriveEncoder[StudentLessonProgressSnapshot]
  given Decoder[StudentLessonProgressSnapshot] = deriveDecoder[StudentLessonProgressSnapshot]
