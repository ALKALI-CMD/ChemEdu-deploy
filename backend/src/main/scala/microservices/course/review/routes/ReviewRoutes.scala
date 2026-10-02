package microservices.course.review.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.review.api.*
import microservices.course.review.objects.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*

import system.routes.RouteSupport.*

object ReviewRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "courses" / courseId / "reviews" =>
      (
        for
          _ <- logger.info(s"ReviewRoutes received POST /api/v1/courses/$courseId/reviews")
          payload <- req.as[SubmitCourseReviewAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            SubmitCourseReviewAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }


