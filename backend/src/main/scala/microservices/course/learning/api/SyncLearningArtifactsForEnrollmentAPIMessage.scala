// 文件说明：后端学习接口实现，用于处理同步学习ArtifactsFor报名请求并返回类型安全响应。
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
import microservices.course.catalog.objects.apiTypes.MessageResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class SyncLearningArtifactsForEnrollmentAPIMessage(
  studentId: String,
  courseId: String
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    SyncLearningArtifactsForEnrollmentAPIMessage.schema.execute(this, connection)

object SyncLearningArtifactsForEnrollmentAPIMessage:
  val inputDecoder: Decoder[SyncLearningArtifactsForEnrollmentAPIMessage] = deriveDecoder[SyncLearningArtifactsForEnrollmentAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[SyncLearningArtifactsForEnrollmentAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "SyncLearningArtifactsForEnrollmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      syncLearningArtifactsForEnrollment(connection, input.studentId, input.courseId)
        .as(MessageResponse("Learning artifacts synchronized."))
  )

  private[learning] def syncLearningArtifactsForEnrollment(connection: Connection, studentId: String, courseId: String): IO[Unit] =
    (SubmitAssignmentAPIMessage.cloneAssignmentsForStudent(connection, studentId, courseId) >> SubmitQuizAPIMessage.cloneQuizzesForStudent(connection, studentId, courseId))

  given Decoder[SyncLearningArtifactsForEnrollmentAPIMessage] = inputDecoder
  given Encoder[SyncLearningArtifactsForEnrollmentAPIMessage] = deriveEncoder[SyncLearningArtifactsForEnrollmentAPIMessage]
