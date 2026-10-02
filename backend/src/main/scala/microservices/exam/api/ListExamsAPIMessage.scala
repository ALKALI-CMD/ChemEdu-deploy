// 文件说明：考试评定域接口实现，用于按角色拉取可见的考试列表（学生仅可见已公布/已归档考试）。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserRole
import microservices.exam.objects.{ExamStatus, TrainingCohort}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListExamsAPIMessage(
  sessionToken: String,
  cohortId: Option[String]
) extends ConnectionAPIMessage[ExamListResponse]:
  override def plan(connection: Connection): IO[ExamListResponse] =
    ListExamsAPIMessage.schema.execute(this, connection)

object ListExamsAPIMessage:
  val inputDecoder: Decoder[ListExamsAPIMessage] = deriveDecoder[ListExamsAPIMessage]
  val outputEncoder: Encoder[ExamListResponse] = deriveEncoder[ExamListResponse]
  val schema: ConnectionApiMessageSchema[ListExamsAPIMessage, ExamListResponse] =
    ConnectionApiMessageSchema(
      name = "ListExamsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          allCohorts <- ExamTable.listCohorts(connection)
          visibleCohorts <- currentUser.role match
            case UserRole.Student =>
              IO.pure(allCohorts.filter(_.memberIds.contains(currentUser.id)))
            case _ => IO.pure(allCohorts)
          visibleCohortIds = visibleCohorts.map(_.id).toSet
          allExams <- ExamTable.listExams(connection, input.cohortId)
          exams = currentUser.role match
            case UserRole.Student =>
              allExams.filter(exam =>
                visibleCohortIds.contains(exam.cohortId) &&
                  (exam.status == ExamStatus.Released.entryName || exam.status == ExamStatus.Archived.entryName)
              )
            case _ => allExams
        yield ExamListResponse("考试列表已返回。", exams, visibleCohorts)
    )
  given Decoder[ListExamsAPIMessage] = inputDecoder
  given Encoder[ListExamsAPIMessage] = deriveEncoder[ListExamsAPIMessage]
