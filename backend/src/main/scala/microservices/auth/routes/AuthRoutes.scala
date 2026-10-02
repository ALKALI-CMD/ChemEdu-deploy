package microservices.auth.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.auth.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object AuthRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "sessions" =>
      (
        for
          _ <- logger.info("AuthRoutes received POST /api/v1/sessions")
          payload <- req.as[LoginAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => LoginAPIMessage.schema.execute(payload, connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "sessions" =>
      (
        for
          _ <- logger.info("AuthRoutes received DELETE /api/v1/sessions")
          payload <- req.as[LogoutAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => LogoutAPIMessage.schema.execute(payload, connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "users" =>
      (
        for
          _ <- logger.info("AuthRoutes received POST /api/v1/users")
          payload <- req.as[RegisterAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => RegisterAPIMessage.schema.execute(payload, connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "profile" =>
      (
        for
          _ <- logger.info("AuthRoutes received PUT /api/v1/profile")
          payload <- req.as[UpdateProfileAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpdateProfileAPIMessage.schema.execute(payload, connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "profile" / "password" =>
      (
        for
          _ <- logger.info("AuthRoutes received PATCH /api/v1/profile/password")
          payload <- req.as[ChangePasswordAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => ChangePasswordAPIMessage.schema.execute(payload, connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }
