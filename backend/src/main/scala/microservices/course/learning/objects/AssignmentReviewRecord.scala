// 文件说明：定义学习作业评价/批改Record领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder, HCursor}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.objects.*
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*

final case class AssignmentReviewRecord(
  reviewNumber: Int,
  rawScore: Int,
  finalScore: Int,
  latePenaltyAppliedPercent: Int,
  latePenaltyAppliedPoints: Int,
  feedback: String,
  reviewerName: String,
  reviewedAt: String,
  rubricScores: List[AssignmentRubricScore],
  teacherAnnotations: List[TeacherAnnotation]
)

object AssignmentReviewRecord:
  given Encoder[AssignmentReviewRecord] = deriveEncoder[AssignmentReviewRecord]
  given Decoder[AssignmentReviewRecord] = deriveDecoder[AssignmentReviewRecord]

