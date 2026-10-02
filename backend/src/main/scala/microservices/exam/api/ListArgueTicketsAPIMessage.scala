// 文件说明：考试评定域接口实现，用于阅卷人员查看争分工单列表。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListArgueTicketsAPIMessage(
  sessionToken: String,
  examId: Option[String]
) extends ConnectionAPIMessage[ArgueListResponse]:
  override def plan(connection: Connection): IO[ArgueListResponse] =
    ListArgueTicketsAPIMessage.schema.execute(this, connection)

object ListArgueTicketsAPIMessage:
  val inputDecoder: Decoder[ListArgueTicketsAPIMessage] = deriveDecoder[ListArgueTicketsAPIMessage]
  val outputEncoder: Encoder[ArgueListResponse] = deriveEncoder[ArgueListResponse]
  val schema: ConnectionApiMessageSchema[ListArgueTicketsAPIMessage, ArgueListResponse] =
    ConnectionApiMessageSchema(
      name = "ListArgueTicketsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireGrader(currentUser)
          tickets <- ExamTable.listArgues(connection, input.examId)
        yield ArgueListResponse("争分工单已返回。", tickets)
    )
  given Decoder[ListArgueTicketsAPIMessage] = inputDecoder
  given Encoder[ListArgueTicketsAPIMessage] = deriveEncoder[ListArgueTicketsAPIMessage]
