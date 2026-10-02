// 文件说明：考试评定域接口实现，用于学生查看自己某场考试的判分结果、折合分与班级位置。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserRole
import microservices.exam.objects.{ExamClassSummary, ExamStatus, SheetStatus}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class GetStudentExamResultAPIMessage(
  sessionToken: String,
  examId: String
) extends ConnectionAPIMessage[StudentExamResultResponse]:
  override def plan(connection: Connection): IO[StudentExamResultResponse] =
    GetStudentExamResultAPIMessage.schema.execute(this, connection)

object GetStudentExamResultAPIMessage:
  val inputDecoder: Decoder[GetStudentExamResultAPIMessage] = deriveDecoder[GetStudentExamResultAPIMessage]
  val outputEncoder: Encoder[StudentExamResultResponse] = deriveEncoder[StudentExamResultResponse]
  val schema: ConnectionApiMessageSchema[GetStudentExamResultAPIMessage, StudentExamResultResponse] =
    ConnectionApiMessageSchema(
      name = "GetStudentExamResultAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- currentUser.role match
            case UserRole.Student | UserRole.Admin => IO.unit
            case _ => IO.raiseError(new IllegalArgumentException("只有学生可以查询个人考试成绩。"))
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          _ <- if exam.status == ExamStatus.Released.entryName || exam.status == ExamStatus.Archived.entryName then IO.unit
            else IO.raiseError(new IllegalArgumentException("本场考试成绩尚未公布。"))
          cohort <- ExamTable.findCohortById(connection, exam.cohortId)
          sheet <- ExamTable.findSheetByExamAndStudent(connection, exam.id, currentUser.id)
          scores <- sheet match
            case Some(found) => ExamTable.listScoresBySheet(connection, found.id)
            case None => IO.pure(List.empty)
          argues <- sheet match
            case Some(found) => ExamTable.listArgues(connection, Some(exam.id)).map(_.filter(_.sheetId == found.id))
            case None => IO.pure(List.empty)
          analysis <- sheet match
            case Some(found) => ExamTable.findAnalysis(connection, exam.id, currentUser.id)
            case None => IO.pure(None)
          allSheets <- ExamTable.listSheetsByExam(connection, exam.id)
          gradedSheets = allSheets.filter(_.status == SheetStatus.Graded.entryName)
          gradedRaw = gradedSheets.flatMap(_.rawTotal)
          gradedConverted = gradedSheets.flatMap(_.convertedTotal)
          classSummary = ExamClassSummary(
            studentCount = allSheets.size,
            gradedCount = gradedSheets.size,
            avgRaw = if gradedRaw.isEmpty then None else Some(BigDecimal(gradedRaw.sum / gradedRaw.size).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble),
            avgConverted = if gradedConverted.isEmpty then None else Some(BigDecimal(gradedConverted.sum / gradedConverted.size).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble)
          )
        yield StudentExamResultResponse(
          message = "考试成绩已返回。",
          exam = exam,
          cohortName = cohort.map(_.name).getOrElse(""),
          sheet = sheet,
          scores = scores,
          argues = argues,
          analysis = analysis,
          classSummary = classSummary
        )
    )
  given Decoder[GetStudentExamResultAPIMessage] = inputDecoder
  given Encoder[GetStudentExamResultAPIMessage] = deriveEncoder[GetStudentExamResultAPIMessage]
