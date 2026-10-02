package microservices.dashboard.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.dashboard.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object DashboardRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "dashboard" / "base" =>
      (
        for
          _ <- logger.info("DashboardRoutes received POST /api/v1/dashboard/base")
          payload <- req.as[GetDashboardBaseAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => payload.plan(connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "dashboard" / "learning" =>
      (
        for
          _ <- logger.info("DashboardRoutes received POST /api/v1/dashboard/learning")
          payload <- req.as[GetDashboardLearningAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => payload.plan(connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "dashboard" / "business" =>
      (
        for
          _ <- logger.info("DashboardRoutes received POST /api/v1/dashboard/business")
          payload <- req.as[GetDashboardBusinessAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => payload.plan(connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "dashboard" / "governance" =>
      (
        for
          _ <- logger.info("DashboardRoutes received POST /api/v1/dashboard/governance")
          payload <- req.as[GetDashboardGovernanceAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => payload.plan(connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "dashboard" / "teaching-insights" =>
      (
        for
          _ <- logger.info("DashboardRoutes received POST /api/v1/dashboard/teaching-insights")
          payload <- req.as[GetTeachingInsightsAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => payload.plan(connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }

