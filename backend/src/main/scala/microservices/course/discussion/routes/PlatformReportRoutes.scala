package microservices.course.discussion.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.course.discussion.api.{CreatePlatformReportAPIMessage, ResolvePlatformReportAPIMessage}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object PlatformReportRoutes:
  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "reports" =>
      (for
        _ <- logger.info("PlatformReportRoutes received POST /api/v1/reports")
        payload <- req.as[CreatePlatformReportAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => CreatePlatformReportAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "reports" / reportId =>
      (for
        _ <- logger.info(s"PlatformReportRoutes received PATCH /api/v1/reports/$reportId")
        payload <- req.as[ResolvePlatformReportAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ResolvePlatformReportAPIMessage.schema.execute(payload.copy(reportId = Some(reportId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)
  }

