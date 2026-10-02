// 文件说明：考试评定域接口实现，用于考试窗口状态流转（发布、开阅、公布成绩等）。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.{Exam, ExamStatus}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.time.temporal.ChronoUnit

final case class SetExamStatusAPIMessage(
  sessionToken: String,
  examId: String,
  status: String
) extends ConnectionAPIMessage[ExamMutationResponse]:
  override def plan(connection: Connection): IO[ExamMutationResponse] =
    SetExamStatusAPIMessage.schema.execute(this, connection)

object SetExamStatusAPIMessage:
  val inputDecoder: Decoder[SetExamStatusAPIMessage] = deriveDecoder[SetExamStatusAPIMessage]
  val outputEncoder: Encoder[ExamMutationResponse] = deriveEncoder[ExamMutationResponse]
  val schema: ConnectionApiMessageSchema[SetExamStatusAPIMessage, ExamMutationResponse] =
    ConnectionApiMessageSchema(
      name = "SetExamStatusAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireExamManager(currentUser)
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          target <- IO.fromOption(ExamStatus.fromString(input.status))(
            new IllegalArgumentException(s"未知的考试状态：${input.status}")
          )
          now <- IO.pure(Instant.now())
          (newStatus, argueDeadline, releasedAt) = target match
            case ExamStatus.Released =>
              val deadline = now.plus(exam.argueHours.toLong.max(1), ChronoUnit.HOURS)
              (target.entryName, Some(deadline.toString), Some(now.toString))
            case _ => (target.entryName, exam.argueDeadline, exam.releasedAt)
          _ <- (target, exam.status) match
            case (ExamStatus.Released, _) =>
              if exam.gradingRegions.isEmpty then
                IO.raiseError(new IllegalArgumentException("发布成绩前请先在答题卡上划定每道题的改题区域。"))
              else if exam.questions.isEmpty then
                IO.raiseError(new IllegalArgumentException("发布成绩前请先录入试卷题目。"))
              else IO.unit
            case _ => IO.unit
          _ <- ExamTable.updateExamStatus(connection, exam.id, newStatus, argueDeadline, releasedAt)
          updated <- ExamTable.findExamById(connection, exam.id).map(_.getOrElse(exam))
        yield ExamMutationResponse(s"考试状态已更新为${statusLabel(newStatus)}。", updated)
    )

  private def statusLabel(status: String): String =
    ExamStatus.fromString(status).map {
      case ExamStatus.Draft => "草稿"
      case ExamStatus.Published => "已发布（待考）"
      case ExamStatus.Grading => "阅卷中"
      case ExamStatus.Released => "成绩已公布"
      case ExamStatus.Archived => "已归档"
    }.getOrElse(status)
  given Decoder[SetExamStatusAPIMessage] = inputDecoder
  given Encoder[SetExamStatusAPIMessage] = deriveEncoder[SetExamStatusAPIMessage]
