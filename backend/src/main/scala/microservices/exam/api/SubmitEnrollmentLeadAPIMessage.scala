// 文件说明：考试评定域接口实现，用于官网公开表单提交报名咨询线索（无需登录）。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.exam.objects.EnrollmentLead
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class SubmitEnrollmentLeadAPIMessage(
  studentName: String,
  contact: String,
  gradeLevel: String,
  targetStage: String,
  courseInterest: String,
  message: String
) extends ConnectionAPIMessage[EnrollmentLeadMutationResponse]:
  override def plan(connection: Connection): IO[EnrollmentLeadMutationResponse] =
    SubmitEnrollmentLeadAPIMessage.schema.execute(this, connection)

object SubmitEnrollmentLeadAPIMessage:
  val inputDecoder: Decoder[SubmitEnrollmentLeadAPIMessage] = deriveDecoder[SubmitEnrollmentLeadAPIMessage]
  val outputEncoder: Encoder[EnrollmentLeadMutationResponse] = deriveEncoder[EnrollmentLeadMutationResponse]
  val schema: ConnectionApiMessageSchema[SubmitEnrollmentLeadAPIMessage, EnrollmentLeadMutationResponse] =
    ConnectionApiMessageSchema(
      name = "SubmitEnrollmentLeadAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          _ <- if input.studentName.trim.nonEmpty then IO.unit
            else IO.raiseError(new IllegalArgumentException("请填写学生姓名。"))
          _ <- if input.contact.trim.nonEmpty then IO.unit
            else IO.raiseError(new IllegalArgumentException("请填写联系电话或微信。"))
          now <- IO.pure(Instant.now().toString)
          lead = EnrollmentLead(
            id = s"lead-${UUID.randomUUID().toString.take(8)}",
            studentName = input.studentName.trim,
            contact = input.contact.trim,
            gradeLevel = input.gradeLevel.trim,
            targetStage = input.targetStage.trim,
            courseInterest = input.courseInterest.trim,
            message = input.message.trim,
            status = "new",
            createdAt = now
          )
          _ <- ExamTable.insertLead(connection, lead)
        yield EnrollmentLeadMutationResponse("报名咨询已提交，招生老师会尽快与你联系。", lead)
    )
  given Decoder[SubmitEnrollmentLeadAPIMessage] = inputDecoder
  given Encoder[SubmitEnrollmentLeadAPIMessage] = deriveEncoder[SubmitEnrollmentLeadAPIMessage]
