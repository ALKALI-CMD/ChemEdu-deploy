package microservices.course.discussion.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.course.discussion.api.{MarkNotificationReadAPIMessage, UpdateNotificationSettingAPIMessage}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object NotificationRoutes:
  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ PATCH -> Root / "api" / "v1" / "notifications" / "read" =>
      (for
        _ <- logger.info("NotificationRoutes received PATCH /api/v1/notifications/read")
        payload <- req.as[MarkNotificationReadAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => MarkNotificationReadAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "notifications" / "settings" =>
      (for
        _ <- logger.info("NotificationRoutes received PATCH /api/v1/notifications/settings")
        payload <- req.as[UpdateNotificationSettingAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => UpdateNotificationSettingAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)
  }

