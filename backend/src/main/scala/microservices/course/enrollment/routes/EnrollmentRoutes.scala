package microservices.course.enrollment.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.course.enrollment.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object EnrollmentRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "courses" / courseId / "enrollments" =>
      (
        for
          _ <- logger.info(s"EnrollmentRoutes received POST /api/v1/courses/$courseId/enrollments")
          payload <- req.as[EnrollCourseAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => EnrollCourseAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }
