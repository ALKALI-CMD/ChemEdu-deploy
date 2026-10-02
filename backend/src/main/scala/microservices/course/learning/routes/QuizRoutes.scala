package microservices.course.learning.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.course.learning.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object QuizRoutes:
  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "courses" / courseId / "quizzes" =>
      (for
        _ <- logger.info(s"QuizRoutes received POST /api/v1/courses/$courseId/quizzes")
        payload <- req.as[PublishQuizAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => PublishQuizAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "quizzes" / quizId / "submissions" =>
      (for
        _ <- logger.info(s"QuizRoutes received POST /api/v1/quizzes/$quizId/submissions")
        payload <- req.as[SubmitQuizAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => SubmitQuizAPIMessage.schema.execute(payload.copy(quizId = Some(quizId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "quizzes" / quizId / "reviews" =>
      (for
        _ <- logger.info(s"QuizRoutes received POST /api/v1/quizzes/$quizId/reviews")
        payload <- req.as[ReviewQuizAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ReviewQuizAPIMessage.schema.execute(payload.copy(quizId = Some(quizId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)
  }

