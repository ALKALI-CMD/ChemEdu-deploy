// 文件说明：考试评定域接口实现，用于教研老师复核争分工单，可维持原判或调整得分。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.{ArgueStatus, QuestionScoreEntry, SheetStatus}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class ResolveArgueTicketAPIMessage(
  sessionToken: String,
  ticketId: String,
  action: String,
  response: String,
  adjustedScore: Option[Double],
  adjustedComment: Option[String]
) extends ConnectionAPIMessage[ArgueMutationResponse]:
  override def plan(connection: Connection): IO[ArgueMutationResponse] =
    ResolveArgueTicketAPIMessage.schema.execute(this, connection)

object ResolveArgueTicketAPIMessage:
  val inputDecoder: Decoder[ResolveArgueTicketAPIMessage] = deriveDecoder[ResolveArgueTicketAPIMessage]
  val outputEncoder: Encoder[ArgueMutationResponse] = deriveEncoder[ArgueMutationResponse]
  val schema: ConnectionApiMessageSchema[ResolveArgueTicketAPIMessage, ArgueMutationResponse] =
    ConnectionApiMessageSchema(
      name = "ResolveArgueTicketAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireExamManager(currentUser)
          _ <- if input.response.trim.nonEmpty then IO.unit
            else IO.raiseError(new IllegalArgumentException("请填写复核结论，告知学生处理结果。"))
          ticket <- ExamTable.findArgueById(connection, input.ticketId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("争分工单不存在。"))
          }
          _ <- if ticket.status == ArgueStatus.Open.entryName then IO.unit
            else IO.raiseError(new IllegalArgumentException("该争分工单已经处理完毕。"))
          now <- IO.pure(Instant.now().toString)
          _ <- input.action.trim.toLowerCase match
            case "adjust" => applyScoreAdjustment(connection, currentUser, ticket, input.adjustedScore, input.adjustedComment, now)
            case "uphold" => IO.unit
            case "reject" => IO.unit
            case other => IO.raiseError(new IllegalArgumentException(s"未知的复核动作：$other"))
          newStatus = if input.action.trim.equalsIgnoreCase("reject") then ArgueStatus.Rejected.entryName else ArgueStatus.Resolved.entryName
          _ <- ExamTable.resolveArgue(connection, ticket.id, newStatus, input.response.trim, currentUser.name, now)
          updated <- ExamTable.findArgueById(connection, ticket.id).map(_.getOrElse(ticket))
        yield ArgueMutationResponse("争分工单已复核。", updated)
    )

  /** 调整得分：更新判分记录（标记为复核调整）并重算答题卡总分。 */
  private def applyScoreAdjustment(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    ticket: microservices.exam.objects.ArgueTicket,
    adjustedScore: Option[Double],
    adjustedComment: Option[String],
    now: String
  ): IO[Unit] =
    for
      newScore <- IO.fromOption(adjustedScore)(
        new IllegalArgumentException("调整得分时必须给出新的分数。")
      )
      exam <- ExamTable.findExamById(connection, ticket.examId).flatMap {
        case Some(found) => IO.pure(found)
        case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
      }
      question <- IO.fromOption(exam.questions.find(_.id == ticket.questionId))(
        new IllegalArgumentException("该题不在本考试试卷中。")
      )
      _ <- if newScore >= 0 && newScore <= question.maxScore then IO.unit
        else IO.raiseError(new IllegalArgumentException(s"调整后的分数必须在 0 到 ${question.maxScore} 之间。"))
      existing <- ExamTable.listScoresBySheet(connection, ticket.sheetId)
      entry <- IO.fromOption(existing.find(_.questionId == question.id))(
        new IllegalArgumentException("未找到原判分记录。")
      )
      converted = SaveQuestionScoreAPIMessage.round1(newScore / question.maxScore * question.convertedScore)
      updatedEntry = entry.copy(
        id = if existing.exists(_.id == entry.id) then entry.id else s"score-${UUID.randomUUID().toString.take(8)}",
        score = newScore,
        convertedScore = converted,
        comment = adjustedComment.map(_.trim).filter(_.nonEmpty).getOrElse(entry.comment),
        graderId = currentUser.id,
        graderName = currentUser.name,
        gradedAt = now,
        adjusted = true
      )
      _ <- ExamTable.updateScore(connection, updatedEntry)
      refreshedScores = existing.filterNot(_.questionId == question.id) :+ updatedEntry
      allScored = exam.questions.forall(question => refreshedScores.exists(_.questionId == question.id))
      rawTotal = SaveQuestionScoreAPIMessage.round1(refreshedScores.map(_.score).sum)
      convertedTotal = SaveQuestionScoreAPIMessage.round1(refreshedScores.map(_.convertedScore).sum)
      _ <- ExamTable.updateSheetTotals(
        connection,
        ticket.sheetId,
        if allScored then SheetStatus.Graded.entryName else SheetStatus.Pending.entryName,
        if refreshedScores.isEmpty then None else Some(rawTotal),
        if refreshedScores.isEmpty then None else Some(convertedTotal),
        if allScored then Some(now) else None
      )
    yield ()

  given Decoder[ResolveArgueTicketAPIMessage] = inputDecoder
  given Encoder[ResolveArgueTicketAPIMessage] = deriveEncoder[ResolveArgueTicketAPIMessage]
