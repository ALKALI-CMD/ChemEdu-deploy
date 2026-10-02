// 文件说明：后端学习接口实现，用于处理评价/批改作业请求并返回类型安全响应。
package microservices.course.learning.api



import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.admin.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

import java.sql.Connection

final case class ReviewAssignmentAPIMessage(
  sessionToken: String,
  assignmentId: Option[String],
  score: Int,
  feedback: String,
  reviewAttachments: List[AssignmentAttachment],
  rubricScores: List[AssignmentRubricScore],
  teacherAnnotations: List[TeacherAnnotation]
) extends ConnectionAPIMessage[AssignmentMutationResponse]:
  override def plan(connection: Connection): IO[AssignmentMutationResponse] =
    ReviewAssignmentAPIMessage.schema.execute(this, connection)



object ReviewAssignmentAPIMessage:
  val inputDecoder: Decoder[ReviewAssignmentAPIMessage] = deriveDecoder[ReviewAssignmentAPIMessage]
  val outputEncoder: Encoder[AssignmentMutationResponse] = deriveEncoder[AssignmentMutationResponse]
  val schema: ConnectionApiMessageSchema[ReviewAssignmentAPIMessage, AssignmentMutationResponse] = ConnectionApiMessageSchema(
    name = "ReviewAssignmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedAssignmentId <- IO.fromOption(input.assignmentId)(
              new IllegalArgumentException("input.assignmentId is required for ReviewAssignmentAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- reviewAssignmentForUser(
              connection,
              currentUser,
              ReviewAssignmentInput(
                assignmentId = resolvedAssignmentId,
                score = input.score,
                feedback = input.feedback,
                reviewAttachments = input.reviewAttachments,
                rubricScores = input.rubricScores,
                teacherAnnotations = input.teacherAnnotations
              )
            )
          yield response
  )

  private[learning] def reviewAssignmentForUser(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    input: ReviewAssignmentInput
  ): IO[AssignmentMutationResponse] =
    SubmitAssignmentAPIMessage.reviewAssignmentForUser(connection, currentUser, input)

  given Decoder[ReviewAssignmentAPIMessage] = inputDecoder
  given Encoder[ReviewAssignmentAPIMessage] = deriveEncoder[ReviewAssignmentAPIMessage]

