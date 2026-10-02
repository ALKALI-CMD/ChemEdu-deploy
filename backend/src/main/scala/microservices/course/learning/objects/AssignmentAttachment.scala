// 文件说明：定义学习作业附件领域数据类型，用于业务流程和接口传输。
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

final case class AssignmentAttachment(
  label: String,
  url: String,
  attachmentType: AssignmentAttachmentType,
  sizeBytes: Option[Long],
  uploadedAt: Option[String]
)

object AssignmentAttachment:
  given Encoder[AssignmentAttachment] = deriveEncoder[AssignmentAttachment]
  given Decoder[AssignmentAttachment] = deriveDecoder[AssignmentAttachment]
