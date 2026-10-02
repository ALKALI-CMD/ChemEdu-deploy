// 文件说明：后端课程讨论接口实现，用于处理创建平台举报请求并返回类型安全响应。
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
import microservices.auth.objects.UserProfile
import microservices.course.catalog.objects.apiTypes.MessageResponse
import microservices.course.discussion.api.ListDiscussionsAPIMessage
import microservices.course.discussion.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.discussion.objects.{DiscussionPinState, DiscussionThreadState, DiscussionVisibility}
import microservices.course.discussion.tables.DiscussionTable

import java.sql.Connection

final case class CreatePlatformReportAPIMessage(
  sessionToken: String,
  targetType: String,
  targetId: String,
  targetLabel: String,
  reason: String,
  detail: Option[String]
) extends ConnectionAPIMessage[PlatformReportMutationResponse]:
  override def plan(connection: Connection): IO[PlatformReportMutationResponse] =
    CreatePlatformReportAPIMessage.schema.execute(this, connection)



object CreatePlatformReportAPIMessage:
  val inputDecoder: Decoder[CreatePlatformReportAPIMessage] = deriveDecoder[CreatePlatformReportAPIMessage]
  val outputEncoder: Encoder[PlatformReportMutationResponse] = deriveEncoder[PlatformReportMutationResponse]
  val schema: ConnectionApiMessageSchema[CreatePlatformReportAPIMessage, PlatformReportMutationResponse] = ConnectionApiMessageSchema(
    name = "CreatePlatformReportAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- CreatePlatformReportAPIMessage.createPlatformReportForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              CreatePlatformReportData(
                targetType = input.targetType,
                targetId = input.targetId,
                targetLabel = input.targetLabel,
                reason = input.reason,
                detail = input.detail
              )
            )
          yield response
  )
  given Decoder[CreatePlatformReportAPIMessage] = inputDecoder
  given Encoder[CreatePlatformReportAPIMessage] = deriveEncoder[CreatePlatformReportAPIMessage]

  private[discussion] def createPlatformReportForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: CreatePlatformReportData
  ): IO[PlatformReportMutationResponse] =
    val targetType = request.targetType.trim.toLowerCase
    val targetId = request.targetId.trim
    val targetLabel = request.targetLabel.trim
    val reason = request.reason.trim
    val detail = request.detail.map(_.trim).filter(_.nonEmpty)
    val allowedTargetTypes = Set("course", "user", "discussion", "reply")

    for
      _ <- ListDiscussionsAPIMessage.ensureNonEmpty(targetId, "Report targetId cannot be empty.")
      _ <- ListDiscussionsAPIMessage.ensureNonEmpty(targetLabel, "Report targetLabel cannot be empty.")
      _ <- ListDiscussionsAPIMessage.ensureNonEmpty(reason, "Report reason cannot be empty.")
      _ <- if allowedTargetTypes.contains(targetType) then IO.unit else IO.raiseError(new IllegalArgumentException("Unsupported report target type."))
      duplicateOpen <- ListDiscussionsAPIMessage.hasOpenReport(table, connection, currentUser.id, targetType, targetId)
      _ <- if duplicateOpen then IO.raiseError(new IllegalArgumentException("You already have an open report for this item.")) else IO.unit
      reportId = ListDiscussionsAPIMessage.generateId("report")
      _ <- DiscussionTable.createPlatformReport(connection, reportId, currentUser.id, currentUser.name, targetType, targetId, targetLabel, reason, detail)
      report <- ListDiscussionsAPIMessage.requirePlatformReport(table, connection, reportId)
    yield PlatformReportMutationResponse("Report submitted.", report)
