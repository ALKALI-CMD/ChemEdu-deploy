// 文件说明：定义学习评价/批改作业领域数据类型，用于业务流程和接口传输。
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

final case class ReviewAssignmentInput(
  assignmentId: String,
  score: Int,
  feedback: String,
  reviewAttachments: List[AssignmentAttachment],
  rubricScores: List[AssignmentRubricScore],
  teacherAnnotations: List[TeacherAnnotation]
)

object ReviewAssignmentInput:
  given Decoder[ReviewAssignmentInput] = deriveDecoder[ReviewAssignmentInput]
  given Encoder[ReviewAssignmentInput] = deriveEncoder[ReviewAssignmentInput]
