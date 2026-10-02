// 文件说明：考试评定域接口实现，用于教研老师创建或更新培训期次。
package microservices.exam.api

import cats.effect.IO
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

final case class UpsertTrainingCohortAPIMessage(
  sessionToken: String,
  id: Option[String],
  name: String,
  season: String,
  startDate: String,
  endDate: String,
  description: String,
  memberIds: List[String],
  status: Option[String]
) extends ConnectionAPIMessage[TrainingCohortMutationResponse]:
  override def plan(connection: Connection): IO[TrainingCohortMutationResponse] =
    UpsertTrainingCohortAPIMessage.schema.execute(this, connection)

object UpsertTrainingCohortAPIMessage:
  val inputDecoder: Decoder[UpsertTrainingCohortAPIMessage] = deriveDecoder[UpsertTrainingCohortAPIMessage]
  val outputEncoder: Encoder[TrainingCohortMutationResponse] = deriveEncoder[TrainingCohortMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertTrainingCohortAPIMessage, TrainingCohortMutationResponse] =
    ConnectionApiMessageSchema(
      name = "UpsertTrainingCohortAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireExamManager(currentUser)
          _ <- if input.name.trim.nonEmpty then IO.unit
            else IO.raiseError(new IllegalArgumentException("期次名称不能为空。"))
          _ <- if input.endDate >= input.startDate then IO.unit
            else IO.raiseError(new IllegalArgumentException("期次结束时间不能早于开始时间。"))
          existing <- input.id match
            case Some(cohortId) => ExamTable.findCohortById(connection, cohortId)
            case None => IO.pure(None)
          cohort <- existing match
            case Some(found) =>
              IO.pure(found.copy(
                name = input.name.trim,
                season = input.season.trim,
                startDate = input.startDate,
                endDate = input.endDate,
                description = input.description,
                memberIds = input.memberIds.map(_.trim).filter(_.nonEmpty).distinct,
                status = input.status.map(_.trim).filter(_.nonEmpty).getOrElse(found.status)
              ))
            case None =>
              IO.pure(TrainingCohort(
                id = s"cohort-${UUID.randomUUID().toString.take(8)}",
                name = input.name.trim,
                season = input.season.trim,
                startDate = input.startDate,
                endDate = input.endDate,
                description = input.description,
                memberIds = input.memberIds.map(_.trim).filter(_.nonEmpty).distinct,
                status = input.status.map(_.trim).filter(_.nonEmpty).getOrElse("active"),
                createdBy = Some(currentUser.id),
                createdAt = Instant.now().toString
              ))
          _ <- existing match
            case Some(_) => ExamTable.updateCohort(connection, cohort)
            case None => ExamTable.insertCohort(connection, cohort)
        yield TrainingCohortMutationResponse("期次已保存。", cohort)
    )
  given Decoder[UpsertTrainingCohortAPIMessage] = inputDecoder
  given Encoder[UpsertTrainingCohortAPIMessage] = deriveEncoder[UpsertTrainingCohortAPIMessage]
