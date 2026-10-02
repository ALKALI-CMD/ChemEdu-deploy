// 文件说明：定义学习作业领域数据类型，用于业务流程和接口传输。
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

final case class Assignment(
  id: String,
  courseId: String,
  title: String,
  description: String,
  deadline: String,
  attachmentLabel: String,
  referenceAttachments: List[AssignmentAttachment],
  submissionStatus: SubmissionStatus,
  score: Option[Int],
  rawScore: Option[Int],
  submissionContent: Option[String],
  submissionNote: Option[String],
  submissionAttachments: List[AssignmentAttachment],
  submittedAt: Option[String],
  feedback: Option[String],
  reviewAttachments: List[AssignmentAttachment],
  reviewerName: Option[String],
  reviewedAt: Option[String],
  attemptCount: Int,
  resubmissionCount: Int,
  maxAttempts: Int,
  allowLateSubmission: Boolean,
  allowResubmission: Boolean,
  allowMakeUpSubmission: Boolean,
  lateSubmissionDeadline: Option[String],
  latePenaltyPercentPerDay: Int,
  latePenaltyCapPercent: Int,
  latePenaltyAppliedPercent: Int,
  lateSubmitted: Boolean,
  reviewCount: Int,
  canResubmit: Boolean,
  rubric: List[AssignmentRubricCriterion],
  rubricScores: List[AssignmentRubricScore],
  teacherAnnotations: List[TeacherAnnotation],
  submissionHistory: List[AssignmentSubmissionRecord],
  reviewHistory: List[AssignmentReviewRecord]
)

object Assignment:
  given Encoder[Assignment] = deriveEncoder[Assignment]
  given Decoder[Assignment] = deriveDecoder[Assignment]

