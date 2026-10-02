// 文件说明：后端学习接口实现，用于处理发布作业请求并返回类型安全响应。
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

final case class PublishAssignmentAPIMessage(
  sessionToken: String,
  courseId: Option[String],
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
) extends ConnectionAPIMessage[AssignmentMutationResponse]:
  override def plan(connection: Connection): IO[AssignmentMutationResponse] =
    PublishAssignmentAPIMessage.schema.execute(this, connection)



object PublishAssignmentAPIMessage:
  val inputDecoder: Decoder[PublishAssignmentAPIMessage] = deriveDecoder[PublishAssignmentAPIMessage]
  val outputEncoder: Encoder[AssignmentMutationResponse] = deriveEncoder[AssignmentMutationResponse]
  val schema: ConnectionApiMessageSchema[PublishAssignmentAPIMessage, AssignmentMutationResponse] = ConnectionApiMessageSchema(
    name = "PublishAssignmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(
              new IllegalArgumentException("input.courseId is required for PublishAssignmentAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- publishAssignmentForUser(
              connection,
              currentUser,
              PublishAssignmentInput(
                courseId = resolvedCourseId,
                title = input.title,
                description = input.description,
                deadline = input.deadline,
                attachmentLabel = input.attachmentLabel,
                maxAttempts = input.maxAttempts,
                allowLateSubmission = input.allowLateSubmission,
                allowResubmission = input.allowResubmission,
                allowMakeUpSubmission = input.allowMakeUpSubmission,
                lateSubmissionDeadline = input.lateSubmissionDeadline,
                latePenaltyPercentPerDay = input.latePenaltyPercentPerDay,
                latePenaltyCapPercent = input.latePenaltyCapPercent,
                rubric = input.rubric,
                referenceAttachments = input.referenceAttachments
              )
            )
          yield response
  )

  private[learning] def publishAssignmentForUser(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    input: PublishAssignmentInput
  ): IO[AssignmentMutationResponse] =
    SubmitAssignmentAPIMessage.publishAssignmentForUser(connection, currentUser, input)

  given Decoder[PublishAssignmentAPIMessage] = inputDecoder
  given Encoder[PublishAssignmentAPIMessage] = deriveEncoder[PublishAssignmentAPIMessage]

