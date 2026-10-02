// 文件说明：考试评定域接口实现，用于助教老师上传学生答题卡（同一考试重复上传会覆盖并清空旧判分）。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.{AnswerSheet, ExamStatus, SheetStatus}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class UploadAnswerSheetAPIMessage(
  sessionToken: String,
  examId: String,
  studentId: String,
  imageDataUrl: String
) extends ConnectionAPIMessage[AnswerSheetMutationResponse]:
  override def plan(connection: Connection): IO[AnswerSheetMutationResponse] =
    UploadAnswerSheetAPIMessage.schema.execute(this, connection)

object UploadAnswerSheetAPIMessage:
  private val maxImageLength = 8_000_000

  val inputDecoder: Decoder[UploadAnswerSheetAPIMessage] = deriveDecoder[UploadAnswerSheetAPIMessage]
  val outputEncoder: Encoder[AnswerSheetMutationResponse] = deriveEncoder[AnswerSheetMutationResponse]
  val schema: ConnectionApiMessageSchema[UploadAnswerSheetAPIMessage, AnswerSheetMutationResponse] =
    ConnectionApiMessageSchema(
      name = "UploadAnswerSheetAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireGrader(currentUser)
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          _ <- if exam.status == ExamStatus.Released.entryName || exam.status == ExamStatus.Archived.entryName then
            IO.raiseError(new IllegalArgumentException("成绩已公布，不能继续上传答题卡。"))
          else IO.unit
          _ <- if input.imageDataUrl.startsWith("data:image/") then IO.unit
            else IO.raiseError(new IllegalArgumentException("答题卡必须是图片文件。"))
          _ <- if input.imageDataUrl.length <= maxImageLength then IO.unit
            else IO.raiseError(new IllegalArgumentException("答题卡图片过大，请压缩后重新上传。"))
          studentName <- ExamTable.findUserNameById(connection, input.studentId).flatMap {
            case Some(name) => IO.pure(name)
            case None => IO.raiseError(new IllegalArgumentException("学生账号不存在。"))
          }
          now <- IO.pure(Instant.now().toString)
          sheet = AnswerSheet(
            id = s"sheet-${UUID.randomUUID().toString.take(8)}",
            examId = exam.id,
            studentId = input.studentId,
            studentName = studentName,
            imageDataUrl = input.imageDataUrl,
            status = SheetStatus.Pending.entryName,
            rawTotal = None,
            convertedTotal = None,
            uploadedByName = currentUser.name,
            uploadedAt = now,
            gradedAt = None
          )
          _ <- ExamTable.upsertSheet(connection, sheet)
        yield AnswerSheetMutationResponse("答题卡已上传。", sheet)
    )
  given Decoder[UploadAnswerSheetAPIMessage] = inputDecoder
  given Encoder[UploadAnswerSheetAPIMessage] = deriveEncoder[UploadAnswerSheetAPIMessage]
