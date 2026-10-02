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
import system.objects.HealthResponse
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import org.typelevel.log4cats.slf4j.Slf4jLogger

/** 提供服务健康检查接口的路由�?*/
object HealthRouter:

  private val logger = Slf4jLogger.getLogger[IO]

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root / "api" / "health" =>
      for
        _ <- logger.info("HealthRouter received GET /api/health")
        response <- Ok(HealthResponse(status = "ok", service = "backend-sample").asJson)
      yield response
  }
