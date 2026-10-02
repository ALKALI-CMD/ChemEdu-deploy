package system.routes

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.syntax.*
import system.objects.ErrorResponse
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import org.typelevel.log4cats.slf4j.Slf4jLogger

object RouteSupport:

  val logger = Slf4jLogger.getLogger[IO]

  def handleError(error: Throwable): IO[org.http4s.Response[IO]] =
    for
      _ <- logger.error(error)(s"Route handling failed: ${error.getMessage}")
      response <- BadRequest(ErrorResponse(error.getMessage).asJson)
    yield response
