// 文件说明：考试评定域接口实现，用于助教老师为某张答题卡的单道题打分并自动折算折合分。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.{QuestionScoreEntry, SheetStatus}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class SaveQuestionScoreAPIMessage(
  sessionToken: String,
  sheetId: String,
  questionId: String,
  score: Double,
  comment: String
) extends ConnectionAPIMessage[QuestionScoreMutationResponse]:
  override def plan(connection: Connection): IO[QuestionScoreMutationResponse] =
    SaveQuestionScoreAPIMessage.schema.execute(this, connection)

object SaveQuestionScoreAPIMessage:
  val inputDecoder: Decoder[SaveQuestionScoreAPIMessage] = deriveDecoder[SaveQuestionScoreAPIMessage]
  val outputEncoder: Encoder[QuestionScoreMutationResponse] = deriveEncoder[QuestionScoreMutationResponse]
  val schema: ConnectionApiMessageSchema[SaveQuestionScoreAPIMessage, QuestionScoreMutationResponse] =
    ConnectionApiMessageSchema(
      name = "SaveQuestionScoreAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireGrader(currentUser)
          sheet <- ExamTable.findSheetById(connection, input.sheetId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("答题卡不存在。"))
          }
          exam <- ExamTable.findExamById(connection, sheet.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          question <- IO.fromOption(exam.questions.find(_.id == input.questionId))(
            new IllegalArgumentException("该题不在本考试试卷中。")
          )
          _ <- if input.score >= 0 && input.score <= question.maxScore then IO.unit
            else IO.raiseError(new IllegalArgumentException(s"分数必须在 0 到 ${question.maxScore} 之间。"))
          now <- IO.pure(Instant.now().toString)
          converted = round1(input.score / question.maxScore * question.convertedScore)
          existing <- ExamTable.listScoresBySheet(connection, sheet.id)
          existingEntry = existing.find(_.questionId == question.id)
          entry = existingEntry match
            case Some(found) =>
              found.copy(
                score = input.score,
                convertedScore = converted,
                comment = input.comment,
                graderId = currentUser.id,
                graderName = currentUser.name,
                gradedAt = now
              )
            case None =>
              QuestionScoreEntry(
                id = s"score-${UUID.randomUUID().toString.take(8)}",
                examId = exam.id,
                sheetId = sheet.id,
                questionId = question.id,
                score = input.score,
                maxScore = question.maxScore,
                convertedScore = converted,
                comment = input.comment,
                graderId = currentUser.id,
                graderName = currentUser.name,
                gradedAt = now,
                adjusted = false
              )
          _ <- existingEntry match
            case Some(_) => ExamTable.updateScore(connection, entry)
            case None =>
              ExamTable.deleteScore(connection, sheet.id, question.id) *> ExamTable.insertScore(connection, entry)
          // 重新汇总整张答题卡的卷面总分与折合总分
          refreshedScores = existing.filterNot(_.questionId == question.id) :+ entry
          allScored = exam.questions.forall(question => refreshedScores.exists(_.questionId == question.id))
          rawTotal = round1(refreshedScores.map(_.score).sum)
          convertedTotal = round1(refreshedScores.map(_.convertedScore).sum)
          _ <- ExamTable.updateSheetTotals(
            connection,
            sheet.id,
            if allScored then SheetStatus.Graded.entryName else SheetStatus.Pending.entryName,
            if refreshedScores.isEmpty then None else Some(rawTotal),
            if refreshedScores.isEmpty then None else Some(convertedTotal),
            if allScored then Some(now) else None
          )
          updatedSheet <- ExamTable.findSheetById(connection, sheet.id).map(_.getOrElse(sheet))
        yield QuestionScoreMutationResponse("判分已保存。", updatedSheet, refreshedScores.sortBy(_.gradedAt))
    )

  private[exam] def round1(value: Double): Double =
    BigDecimal(value).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble

  given Decoder[SaveQuestionScoreAPIMessage] = inputDecoder
  given Encoder[SaveQuestionScoreAPIMessage] = deriveEncoder[SaveQuestionScoreAPIMessage]
