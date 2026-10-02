// 文件说明：定义学习提交作业领域数据类型，用于业务流程和接口传输。
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

final case class SubmitAssignmentInput(
  assignmentId: String,
  submissionContent: String,
  submissionAttachments: List[AssignmentAttachment],
  submissionNote: Option[String]
)

object SubmitAssignmentInput:
  given Decoder[SubmitAssignmentInput] = deriveDecoder[SubmitAssignmentInput]
  given Encoder[SubmitAssignmentInput] = deriveEncoder[SubmitAssignmentInput]
