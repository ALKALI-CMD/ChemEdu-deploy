// 文件说明：后端课程讨论接口实现，用于处理列表查询平台Reports请求并返回类型安全响应。
package microservices.course.discussion.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.discussion.objects.PlatformReport
import microservices.course.discussion.tables.DiscussionTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListPlatformReportsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[PlatformReport]]:
  override def plan(connection: Connection): IO[List[PlatformReport]] =
    ListPlatformReportsAPIMessage.schema.execute(this, connection)

object ListPlatformReportsAPIMessage:
  val inputDecoder: Decoder[ListPlatformReportsAPIMessage] = deriveDecoder[ListPlatformReportsAPIMessage]
  val outputEncoder: Encoder[List[PlatformReport]] = deriveEncoder[List[PlatformReport]]
  val schema: ConnectionApiMessageSchema[ListPlatformReportsAPIMessage, List[PlatformReport]] = ConnectionApiMessageSchema(
    name = "ListPlatformReportsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        reports <- listPlatformReports(connection, currentUser)
      yield reports
  )


  given Decoder[ListPlatformReportsAPIMessage] = inputDecoder
  given Encoder[ListPlatformReportsAPIMessage] = deriveEncoder[ListPlatformReportsAPIMessage]

  def listPlatformReports(connection: Connection, currentUser: UserProfile): IO[List[PlatformReport]] =
    if currentUser.role == UserRole.Admin then
      DiscussionTable.selectList(connection, DiscussionTable.listAllPlatformReportsSql)(DiscussionTable.readPlatformReport)
    else
      DiscussionTable.selectPreparedList(connection, DiscussionTable.listReporterPlatformReportsSql) { statement =>
        statement.setString(1, currentUser.id)
      }(DiscussionTable.readPlatformReport)
