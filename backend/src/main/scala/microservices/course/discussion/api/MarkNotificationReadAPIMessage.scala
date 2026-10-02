// 文件说明：后端课程讨论接口实现，用于处理标记通知Read请求并返回类型安全响应。
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

final case class MarkNotificationReadAPIMessage(
  sessionToken: String,
  notificationId: Option[String],
  read: Boolean
) extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    MarkNotificationReadAPIMessage.schema.execute(this, connection)



object MarkNotificationReadAPIMessage:
  val inputDecoder: Decoder[MarkNotificationReadAPIMessage] = deriveDecoder[MarkNotificationReadAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[MarkNotificationReadAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "MarkNotificationReadAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- ListNotificationsAPIMessage.markNotificationReadForUser(
              ListDiscussionsAPIMessage,
              connection,
              currentUser,
              MarkNotificationReadData(input.notificationId, input.read)
            )
          yield response
  )
  given Decoder[MarkNotificationReadAPIMessage] = inputDecoder
  given Encoder[MarkNotificationReadAPIMessage] = deriveEncoder[MarkNotificationReadAPIMessage]




