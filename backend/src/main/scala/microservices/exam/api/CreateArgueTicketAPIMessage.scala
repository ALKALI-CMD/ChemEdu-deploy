// 文件说明：考试评定域接口实现，用于学生在争分窗口内对某道题的判分提出异议。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserRole
import microservices.exam.objects.{ArgueStatus, ArgueTicket, ExamStatus}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class CreateArgueTicketAPIMessage(
  sessionToken: String,
  examId: String,
  questionId: String,
  reason: String
) extends ConnectionAPIMessage[ArgueMutationResponse]:
  override def plan(connection: Connection): IO[ArgueMutationResponse] =
    CreateArgueTicketAPIMessage.schema.execute(this, connection)

object CreateArgueTicketAPIMessage:
  val inputDecoder: Decoder[CreateArgueTicketAPIMessage] = deriveDecoder[CreateArgueTicketAPIMessage]
  val outputEncoder: Encoder[ArgueMutationResponse] = deriveEncoder[ArgueMutationResponse]
  val schema: ConnectionApiMessageSchema[CreateArgueTicketAPIMessage, ArgueMutationResponse] =
    ConnectionApiMessageSchema(
      name = "CreateArgueTicketAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- currentUser.role match
            case UserRole.Student => IO.unit
            case _ => IO.raiseError(new IllegalArgumentException("只有学生可以提交争分申请。"))
          _ <- if input.reason.trim.length >= 5 then IO.unit
            else IO.raiseError(new IllegalArgumentException("请填写至少 5 个字的争分理由。"))
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          _ <- if exam.status == ExamStatus.Released.entryName then IO.unit
            else IO.raiseError(new IllegalArgumentException("本场考试当前不在争分窗口内。"))
          now <- IO.pure(Instant.now())
          _ <- exam.argueDeadline match
            case Some(deadline) =>
              IO.blocking(Instant.parse(deadline)).flatMap { parsed =>
                if now.isBefore(parsed) then IO.unit
                else IO.raiseError(new IllegalArgumentException("争分窗口已关闭。"))
              }.handleErrorWith(_ => IO.raiseError(new IllegalArgumentException("争分截止时间解析失败。")))
            case None => IO.unit
          question <- IO.fromOption(exam.questions.find(_.id == input.questionId))(
            new IllegalArgumentException("该题不在本考试试卷中。")
          )
          sheet <- ExamTable.findSheetByExamAndStudent(connection, exam.id, currentUser.id).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("未找到你的答题卡，无法提交争分。"))
          }
          existingTickets <- ExamTable.listArgues(connection, Some(exam.id))
          _ <- if existingTickets.exists(ticket =>
            ticket.sheetId == sheet.id && ticket.questionId == question.id && ticket.status == ArgueStatus.Open.entryName) then
            IO.raiseError(new IllegalArgumentException("这道题已有待处理的争分申请，请等待复核结果。"))
          else IO.unit
          ticket = ArgueTicket(
            id = s"argue-${UUID.randomUUID().toString.take(8)}",
            examId = exam.id,
            sheetId = sheet.id,
            studentId = currentUser.id,
            studentName = currentUser.name,
            questionId = question.id,
            questionTitle = question.title,
            reason = input.reason.trim,
            status = ArgueStatus.Open.entryName,
            response = "",
            handledByName = None,
            createdAt = now.toString,
            resolvedAt = None
          )
          _ <- ExamTable.insertArgue(connection, ticket)
        yield ArgueMutationResponse("争分申请已提交，教研老师将尽快复核。", ticket)
    )
  given Decoder[CreateArgueTicketAPIMessage] = inputDecoder
  given Encoder[CreateArgueTicketAPIMessage] = deriveEncoder[CreateArgueTicketAPIMessage]
