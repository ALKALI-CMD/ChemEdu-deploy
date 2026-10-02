package microservices.course.learning.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.course.learning.api.UpdateLessonProgressAPIMessage
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object ProgressRoutes:
  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ PATCH -> Root / "api" / "v1" / "lessons" / lessonId / "progress" =>
      (for
        _ <- logger.info(s"ProgressRoutes received PATCH /api/v1/lessons/$lessonId/progress")
        payload <- req.as[UpdateLessonProgressAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => UpdateLessonProgressAPIMessage.schema.execute(payload.copy(lessonId = Some(lessonId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)
  }

