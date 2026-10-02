// 文件说明：定义学习发布作业领域数据类型，用于业务流程和接口传输。
package microservices.course.learning.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.auth.objects.*
import microservices.admin.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

final case class PublishAssignmentInput(
  courseId: String,
  title: String,
  description: String,
  deadline: String,
  attachmentLabel: String,
  maxAttempts: Option[Int],
  allowLateSubmission: Option[Boolean],
  allowResubmission: Option[Boolean],
  allowMakeUpSubmission: Option[Boolean],
  lateSubmissionDeadline: Option[String],
  latePenaltyPercentPerDay: Option[Int],
  latePenaltyCapPercent: Option[Int],
  rubric: List[AssignmentRubricCriterion],
  referenceAttachments: List[AssignmentAttachment]
)

object PublishAssignmentInput:
  given Decoder[PublishAssignmentInput] = deriveDecoder[PublishAssignmentInput]
  given Encoder[PublishAssignmentInput] = deriveEncoder[PublishAssignmentInput]

