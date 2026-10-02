package system.routes

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import cats.syntax.all.*
import io.circe.Json
import io.circe.syntax.*
import system.objects.ErrorResponse
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import org.typelevel.log4cats.slf4j.Slf4jLogger

/** 提供通用 Planner 调度入口的路由�?*/
object PlannerRouter:

  private val logger = Slf4jLogger.getLogger[IO]

  /** 根据名称查找并执行对应的 Planner�?*/
  private def executePlanner(plannerName: String, payload: Json): IO[Json] =
    PlannerRegistry.planners
      .get(plannerName)
      .liftTo[IO](new IllegalArgumentException(s"Unknown planner: $plannerName"))
      .flatMap(_.execute(payload))

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / plannerName =>
      (
        for
          _ <- logger.info(s"PlannerRouter received POST /api/$plannerName")
          bodyJson <- req.as[Json]
          responseJson <- executePlanner(plannerName, bodyJson)
          response <- Ok(responseJson)
        yield response
      ).handleErrorWith { error =>
        for
          _ <- logger.error(error)(s"PlannerRouter failed: ${error.getMessage}")
          response <- BadRequest(ErrorResponse(error.getMessage).asJson)
        yield response
      }
  }
