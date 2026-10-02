// 文件说明：考试评定域接口实现，用于教研老师创建或编辑考试（试卷题目与折合规则）。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.*
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class UpsertExamAPIMessage(
  sessionToken: String,
  id: Option[String],
  cohortId: String,
  name: String,
  description: String,
  scheduledStart: String,
  scheduledEnd: String,
  argueHours: Option[Int],
  questions: List[ExamQuestion]
) extends ConnectionAPIMessage[ExamMutationResponse]:
  override def plan(connection: Connection): IO[ExamMutationResponse] =
    UpsertExamAPIMessage.schema.execute(this, connection)

object UpsertExamAPIMessage:
  val inputDecoder: Decoder[UpsertExamAPIMessage] = deriveDecoder[UpsertExamAPIMessage]
  val outputEncoder: Encoder[ExamMutationResponse] = deriveEncoder[ExamMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertExamAPIMessage, ExamMutationResponse] =
    ConnectionApiMessageSchema(
      name = "UpsertExamAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireExamManager(currentUser)
          _ <- if input.name.trim.nonEmpty then IO.unit
            else IO.raiseError(new IllegalArgumentException("考试名称不能为空。"))
          _ <- if input.scheduledEnd > input.scheduledStart then IO.unit
            else IO.raiseError(new IllegalArgumentException("考试结束时间必须晚于开始时间。"))
          _ <- if input.questions.nonEmpty then IO.unit
            else IO.raiseError(new IllegalArgumentException("请至少录入一道题目。"))
          _ <- input.questions.traverse_(question =>
            if question.maxScore <= 0 || question.convertedScore <= 0 then
              IO.raiseError(new IllegalArgumentException("题目满分与折合满分必须大于 0。"))
            else IO.unit)
          _ <- ExamTable.findCohortById(connection, input.cohortId).flatMap {
            case Some(_) => IO.unit
            case None => IO.raiseError(new IllegalArgumentException("所属期次不存在。"))
          }
          existing <- input.id match
            case Some(examId) => ExamTable.findExamById(connection, examId)
            case None => IO.pure(None)
          normalizedQuestions = input.questions.zipWithIndex.map { case (question, index) =>
            question.copy(
              id = if question.id.trim.nonEmpty then question.id.trim else s"q-${UUID.randomUUID().toString.take(8)}",
              orderIndex = index + 1,
              title = question.title.trim,
              topicTag = question.topicTag.trim
            )
          }
          exam <- existing match
            case Some(found) =>
              if found.status == ExamStatus.Released.entryName || found.status == ExamStatus.Archived.entryName then
                IO.raiseError(new IllegalArgumentException("已发布成绩的考试不能再修改试卷结构。"))
              else
                IO.pure(found.copy(
                  cohortId = input.cohortId,
                  name = input.name.trim,
                  description = input.description,
                  scheduledStart = input.scheduledStart,
                  scheduledEnd = input.scheduledEnd,
                  argueHours = input.argueHours.getOrElse(found.argueHours),
                  questions = normalizedQuestions
                ))
            case None =>
              IO.pure(Exam(
                id = s"exam-${UUID.randomUUID().toString.take(8)}",
                cohortId = input.cohortId,
                name = input.name.trim,
                description = input.description,
                scheduledStart = input.scheduledStart,
                scheduledEnd = input.scheduledEnd,
                argueHours = input.argueHours.getOrElse(48),
                argueDeadline = None,
                status = ExamStatus.Draft.entryName,
                questions = normalizedQuestions,
                gradingRegions = Map.empty,
                sheetTemplateImage = None,
                createdBy = currentUser.id,
                createdAt = Instant.now().toString,
                releasedAt = None
              ))
          _ <- existing match
            case Some(_) => ExamTable.updateExam(connection, exam)
            case None => ExamTable.insertExam(connection, exam)
        yield ExamMutationResponse("考试已保存。", exam)
    )
  given Decoder[UpsertExamAPIMessage] = inputDecoder
  given Encoder[UpsertExamAPIMessage] = deriveEncoder[UpsertExamAPIMessage]
