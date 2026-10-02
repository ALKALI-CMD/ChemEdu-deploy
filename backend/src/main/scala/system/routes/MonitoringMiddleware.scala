package system.routes

import cats.effect.IO
import org.http4s.HttpApp
import org.typelevel.log4cats.slf4j.Slf4jLogger

import scala.concurrent.duration.*

object MonitoringMiddleware:

  private val logger = Slf4jLogger.getLogger[IO]

  def apply(app: HttpApp[IO]): HttpApp[IO] =
    HttpApp[IO] { request =>
      for
        startedAt <- IO.monotonic
        response <- app.run(request).attempt
        finishedAt <- IO.monotonic
        durationMs = (finishedAt - startedAt).toMillis
        _ <- response match
          case Right(value) =>
            logger.info(
              s"api_observation method=${request.method.name} path=${request.uri.path.renderString} status=${value.status.code} duration_ms=$durationMs"
            )
          case Left(error) =>
            logger.error(error)(
              s"api_error method=${request.method.name} path=${request.uri.path.renderString} duration_ms=$durationMs"
            )
      yield response.fold(throw _, identity)
    }
