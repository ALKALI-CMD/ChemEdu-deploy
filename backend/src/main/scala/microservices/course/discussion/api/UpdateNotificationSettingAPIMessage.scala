// 文件说明：后端课程讨论接口实现，用于处理更新通知设置请求并返回类型安全响应。
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
import microservices.course.catalog.objects.apiTypes.MessageResponse
import microservices.course.discussion.api.ListDiscussionsAPIMessage
import microservices.course.discussion.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.discussion.objects.{DiscussionPinState, DiscussionThreadState, DiscussionVisibility}

import java.sql.Connection

final case class UpdateNotificationSettingAPIMessage(
  sessionToken: String,
  category: String,
  enabled: Boolean
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    UpdateNotificationSettingAPIMessage.schema.execute(this, connection)



object UpdateNotificationSettingAPIMessage:
  val inputDecoder: Decoder[UpdateNotificationSettingAPIMessage] = deriveDecoder[UpdateNotificationSettingAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[UpdateNotificationSettingAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "UpdateNotificationSettingAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ListNotificationsAPIMessage.updateNotificationSettingForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              UpdateNotificationSettingData(input.category, input.enabled)
            )
          yield response
  )
  given Decoder[UpdateNotificationSettingAPIMessage] = inputDecoder
  given Encoder[UpdateNotificationSettingAPIMessage] = deriveEncoder[UpdateNotificationSettingAPIMessage]




