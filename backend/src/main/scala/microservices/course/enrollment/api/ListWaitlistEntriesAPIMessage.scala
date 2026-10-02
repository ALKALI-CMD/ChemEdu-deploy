// 文件说明：后端课程报名接口实现，用于处理列表查询候补名单Entries请求并返回类型安全响应。
package microservices.course.enrollment.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.enrollment.objects.WaitlistEntry
import microservices.course.enrollment.tables.EnrollmentTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListWaitlistEntriesAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[WaitlistEntry]]:
  override def plan(connection: Connection): IO[List[WaitlistEntry]] =
    ListWaitlistEntriesAPIMessage.schema.execute(this, connection)

object ListWaitlistEntriesAPIMessage:
  val inputDecoder: Decoder[ListWaitlistEntriesAPIMessage] = deriveDecoder[ListWaitlistEntriesAPIMessage]
  val outputEncoder: Encoder[List[WaitlistEntry]] = Encoder.encodeList[WaitlistEntry]
  val schema: ConnectionApiMessageSchema[ListWaitlistEntriesAPIMessage, List[WaitlistEntry]] = ConnectionApiMessageSchema(
    name = "ListWaitlistEntriesAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        entries <- EnrollmentTable.listWaitlistEntries(connection, currentUser)
      yield entries
  )
  given Decoder[ListWaitlistEntriesAPIMessage] = inputDecoder
  given Encoder[ListWaitlistEntriesAPIMessage] = deriveEncoder[ListWaitlistEntriesAPIMessage]
