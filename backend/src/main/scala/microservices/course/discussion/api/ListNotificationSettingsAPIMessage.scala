// 文件说明：后端课程讨论接口实现，用于处理列表查询通知Settings请求并返回类型安全响应。
package microservices.course.discussion.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserProfile
import microservices.course.discussion.objects.{NotificationSetting}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListNotificationSettingsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[NotificationSetting]]:
  override def plan(connection: Connection): IO[List[NotificationSetting]] =
    ListNotificationSettingsAPIMessage.schema.execute(this, connection)

object ListNotificationSettingsAPIMessage:
  val inputDecoder: Decoder[ListNotificationSettingsAPIMessage] = deriveDecoder[ListNotificationSettingsAPIMessage]
  val outputEncoder: Encoder[List[NotificationSetting]] = deriveEncoder[List[NotificationSetting]]
  val schema: ConnectionApiMessageSchema[ListNotificationSettingsAPIMessage, List[NotificationSetting]] = ConnectionApiMessageSchema(
    name = "ListNotificationSettingsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        settings <- listNotificationSettings(connection, currentUser)
      yield settings
  )

  def listNotificationSettings(connection: Connection, currentUser: UserProfile): IO[List[NotificationSetting]] =
    ListNotificationsAPIMessage.listNotificationSettings(ListDiscussionsAPIMessage, connection, currentUser)

  given Decoder[ListNotificationSettingsAPIMessage] = inputDecoder
  given Encoder[ListNotificationSettingsAPIMessage] = deriveEncoder[ListNotificationSettingsAPIMessage]


