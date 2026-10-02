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

object AssignmentRoutes:
  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "courses" / courseId / "assignments" =>
      (for
        _ <- logger.info(s"AssignmentRoutes received POST /api/v1/courses/$courseId/assignments")
        payload <- req.as[PublishAssignmentAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => PublishAssignmentAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "assignments" / assignmentId / "submissions" =>
      (for
        _ <- logger.info(s"AssignmentRoutes received POST /api/v1/assignments/$assignmentId/submissions")
        payload <- req.as[SubmitAssignmentAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => SubmitAssignmentAPIMessage.schema.execute(payload.copy(assignmentId = Some(assignmentId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "assignments" / assignmentId / "reviews" =>
      (for
        _ <- logger.info(s"AssignmentRoutes received POST /api/v1/assignments/$assignmentId/reviews")
        payload <- req.as[ReviewAssignmentAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ReviewAssignmentAPIMessage.schema.execute(payload.copy(assignmentId = Some(assignmentId)), connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)
  }

