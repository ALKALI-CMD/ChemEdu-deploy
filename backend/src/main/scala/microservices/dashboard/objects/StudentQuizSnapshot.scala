// 文件说明：定义看板学生测验Snapshot领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.learning.objects.{QuizQuestion, QuizStatus, SubmissionStatus}

final case class StudentQuizSnapshot(
  courseId: String,
  studentId: String,
  title: String,
  status: QuizStatus,
  score: Option[Int],
  questionBank: List[QuizQuestion],
  wrongQuestionIds: List[String]
)

object StudentQuizSnapshot:
  given Encoder[StudentQuizSnapshot] = deriveEncoder[StudentQuizSnapshot]
  given Decoder[StudentQuizSnapshot] = deriveDecoder[StudentQuizSnapshot]
