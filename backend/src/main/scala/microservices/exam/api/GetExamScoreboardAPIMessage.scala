// 文件说明：考试评定域接口实现，用于教研与数据分析处查看某场考试的折合分成绩册。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.ScoreboardRow
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class GetExamScoreboardAPIMessage(
  sessionToken: String,
  examId: String
) extends ConnectionAPIMessage[ScoreboardResponse]:
  override def plan(connection: Connection): IO[ScoreboardResponse] =
    GetExamScoreboardAPIMessage.schema.execute(this, connection)

object GetExamScoreboardAPIMessage:
  val inputDecoder: Decoder[GetExamScoreboardAPIMessage] = deriveDecoder[GetExamScoreboardAPIMessage]
  val outputEncoder: Encoder[ScoreboardResponse] = deriveEncoder[ScoreboardResponse]
  val schema: ConnectionApiMessageSchema[GetExamScoreboardAPIMessage, ScoreboardResponse] =
    ConnectionApiMessageSchema(
      name = "GetExamScoreboardAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireAnalyst(currentUser)
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          sheets <- ExamTable.listSheetsByExam(connection, exam.id)
          scores <- ExamTable.listScoresByExam(connection, exam.id)
          rows <- IO.pure {
            val unranked = sheets.map { sheet =>
              val sheetScores = scores.filter(_.sheetId == sheet.id)
              ScoreboardRow(
                studentId = sheet.studentId,
                studentName = sheet.studentName,
                questionScores = sheetScores.map(entry => entry.questionId -> entry.score).toMap,
                rawTotal = sheet.rawTotal.getOrElse(0.0),
                convertedTotal = sheet.convertedTotal.getOrElse(0.0),
                rank = 0
              )
            }.sortBy(row => (-row.convertedTotal, -row.rawTotal, row.studentName))
            unranked.zipWithIndex.map { case (row, index) => row.copy(rank = index + 1) }
          }
        yield ScoreboardResponse("成绩册已返回。", exam, rows)
    )
  given Decoder[GetExamScoreboardAPIMessage] = inputDecoder
  given Encoder[GetExamScoreboardAPIMessage] = deriveEncoder[GetExamScoreboardAPIMessage]
