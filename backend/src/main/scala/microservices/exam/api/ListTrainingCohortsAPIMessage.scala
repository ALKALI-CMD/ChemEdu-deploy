// 文件说明：考试评定域接口实现，用于按角色拉取可见的培训期次列表。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserRole
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListTrainingCohortsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[TrainingCohortListResponse]:
  override def plan(connection: Connection): IO[TrainingCohortListResponse] =
    ListTrainingCohortsAPIMessage.schema.execute(this, connection)

object ListTrainingCohortsAPIMessage:
  val inputDecoder: Decoder[ListTrainingCohortsAPIMessage] = deriveDecoder[ListTrainingCohortsAPIMessage]
  val outputEncoder: Encoder[TrainingCohortListResponse] = deriveEncoder[TrainingCohortListResponse]
  val schema: ConnectionApiMessageSchema[ListTrainingCohortsAPIMessage, TrainingCohortListResponse] =
    ConnectionApiMessageSchema(
      name = "ListTrainingCohortsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          all <- ExamTable.listCohorts(connection)
          cohorts = currentUser.role match
            case UserRole.Student => all.filter(_.memberIds.contains(currentUser.id))
            case _ => all
        yield TrainingCohortListResponse("期次列表已返回。", cohorts)
    )
  given Decoder[ListTrainingCohortsAPIMessage] = inputDecoder
  given Encoder[ListTrainingCohortsAPIMessage] = deriveEncoder[ListTrainingCohortsAPIMessage]
