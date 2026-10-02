// 文件说明：后端课程讨论接口实现，用于处理解析平台举报请求并返回类型安全响应。
package microservices.course.discussion.api


import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.catalog.objects.apiTypes.MessageResponse
import microservices.course.discussion.api.ListDiscussionsAPIMessage
import microservices.course.discussion.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.discussion.objects.{DiscussionPinState, DiscussionThreadState, DiscussionVisibility}
import microservices.course.discussion.tables.DiscussionTable

import java.sql.Connection

final case class ResolvePlatformReportAPIMessage(
  sessionToken: String,
  reportId: Option[String],
  status: String,
  resolutionNote: Option[String]
) extends ConnectionAPIMessage[PlatformReportMutationResponse]:
  override def plan(connection: Connection): IO[PlatformReportMutationResponse] =
    ResolvePlatformReportAPIMessage.schema.execute(this, connection)



object ResolvePlatformReportAPIMessage:
  val inputDecoder: Decoder[ResolvePlatformReportAPIMessage] = deriveDecoder[ResolvePlatformReportAPIMessage]
  val outputEncoder: Encoder[PlatformReportMutationResponse] = deriveEncoder[PlatformReportMutationResponse]
  val schema: ConnectionApiMessageSchema[ResolvePlatformReportAPIMessage, PlatformReportMutationResponse] = ConnectionApiMessageSchema(
    name = "ResolvePlatformReportAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedReportId <- IO.fromOption(input.reportId)(
              new IllegalArgumentException("input.reportId is required for ResolvePlatformReportAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ResolvePlatformReportAPIMessage.resolvePlatformReportForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              ResolvePlatformReportData(
                reportId = resolvedReportId,
                status = input.status,
                resolutionNote = input.resolutionNote
              )
            )
          yield response
  )
  given Decoder[ResolvePlatformReportAPIMessage] = inputDecoder
  given Encoder[ResolvePlatformReportAPIMessage] = deriveEncoder[ResolvePlatformReportAPIMessage]

  private[discussion] def resolvePlatformReportForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: ResolvePlatformReportData
  ): IO[PlatformReportMutationResponse] =
    val nextStatus = request.status.trim.toLowerCase
    val allowedStatuses = Set("open", "reviewing", "resolved", "dismissed")
    for
      _ <- if currentUser.role == UserRole.Admin then IO.unit else IO.raiseError(new IllegalArgumentException("Only administrators can process reports."))
      _ <- if allowedStatuses.contains(nextStatus) then IO.unit else IO.raiseError(new IllegalArgumentException("Unsupported report status."))
      existingReport <- ListDiscussionsAPIMessage.requirePlatformReport(table, connection, request.reportId)
      updated <- DiscussionTable.resolvePlatformReport(connection, request.reportId, nextStatus, currentUser.name, request.resolutionNote.map(_.trim).filter(_.nonEmpty))
      _ <- if updated then IO.unit else IO.raiseError(new IllegalArgumentException("Report not found."))
      _ <-
        if nextStatus == "resolved" && ListDiscussionsAPIMessage.isBanAppeal(existingReport) then ListDiscussionsAPIMessage.unbanAppealUser(table, connection, existingReport)
        else if nextStatus == "resolved" && ListDiscussionsAPIMessage.isUserReport(existingReport) then ListDiscussionsAPIMessage.setUserBanned(table, connection, existingReport.targetId, banned = true)
        else IO.unit
      report <- ListDiscussionsAPIMessage.requirePlatformReport(table, connection, request.reportId)
    yield PlatformReportMutationResponse("Report updated.", report)
