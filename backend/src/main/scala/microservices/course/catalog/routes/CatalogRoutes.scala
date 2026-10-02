package microservices.course.catalog.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.course.catalog.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object CatalogRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "courses" =>
      (
        for
          _ <- logger.info("CatalogRoutes received POST /api/v1/courses")
          payload <- req.as[UpsertCourseAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertCourseAPIMessage.schema.execute(payload.copy(courseId = None), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "courses" / courseId =>
      (
        for
          _ <- logger.info(s"CatalogRoutes received PUT /api/v1/courses/$courseId")
          payload <- req.as[UpsertCourseAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertCourseAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "courses" / courseId / "status" =>
      (
        for
          _ <- logger.info(s"CatalogRoutes received PATCH /api/v1/courses/$courseId/status")
          payload <- req.as[UpdateCourseStatusAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpdateCourseStatusAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "courses" / courseId =>
      (
        for
          _ <- logger.info(s"CatalogRoutes received DELETE /api/v1/courses/$courseId")
          payload <- req.as[DeleteCourseAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => DeleteCourseAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }

