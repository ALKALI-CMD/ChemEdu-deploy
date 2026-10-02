// 文件说明：考试评定域接口实现，用于校长与教研老师查看官网报名咨询线索列表。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListEnrollmentLeadsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[EnrollmentLeadListResponse]:
  override def plan(connection: Connection): IO[EnrollmentLeadListResponse] =
    ListEnrollmentLeadsAPIMessage.schema.execute(this, connection)

object ListEnrollmentLeadsAPIMessage:
  val inputDecoder: Decoder[ListEnrollmentLeadsAPIMessage] = deriveDecoder[ListEnrollmentLeadsAPIMessage]
  val outputEncoder: Encoder[EnrollmentLeadListResponse] = deriveEncoder[EnrollmentLeadListResponse]
  val schema: ConnectionApiMessageSchema[ListEnrollmentLeadsAPIMessage, EnrollmentLeadListResponse] =
    ConnectionApiMessageSchema(
      name = "ListEnrollmentLeadsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireExamManager(currentUser)
          leads <- ExamTable.listLeads(connection)
        yield EnrollmentLeadListResponse("报名线索已返回。", leads)
    )
  given Decoder[ListEnrollmentLeadsAPIMessage] = inputDecoder
  given Encoder[ListEnrollmentLeadsAPIMessage] = deriveEncoder[ListEnrollmentLeadsAPIMessage]
