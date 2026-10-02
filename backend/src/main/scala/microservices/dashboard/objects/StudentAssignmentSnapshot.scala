// 文件说明：定义看板学生作业Snapshot领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.learning.objects.{QuizQuestion, QuizStatus, SubmissionStatus}

final case class StudentAssignmentSnapshot(
  courseId: String,
  studentId: String,
  submissionStatus: SubmissionStatus,
  score: Option[Int],
  lateSubmitted: Boolean
)

object StudentAssignmentSnapshot:
  given Encoder[StudentAssignmentSnapshot] = deriveEncoder[StudentAssignmentSnapshot]
  given Decoder[StudentAssignmentSnapshot] = deriveDecoder[StudentAssignmentSnapshot]
