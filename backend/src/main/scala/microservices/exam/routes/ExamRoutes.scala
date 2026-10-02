// 文件说明：考试评定域 HTTP 路由，将考试相关接口挂载到 /api/v1/exam 之下。
package microservices.exam.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.exam.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object ExamRoutes:
  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "exam" / "cohorts" =>
      (for
        payload <- req.as[UpsertTrainingCohortAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => UpsertTrainingCohortAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "cohorts" / "list" =>
      (for
        payload <- req.as[ListTrainingCohortsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ListTrainingCohortsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "create" =>
      (for
        payload <- req.as[UpsertExamAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => UpsertExamAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "list" =>
      (for
        payload <- req.as[ListExamsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ListExamsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "status" =>
      (for
        payload <- req.as[SetExamStatusAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => SetExamStatusAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "regions" =>
      (for
        payload <- req.as[SaveGradingRegionsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => SaveGradingRegionsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "sheets" =>
      (for
        payload <- req.as[UploadAnswerSheetAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => UploadAnswerSheetAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "sheets" / "list" =>
      (for
        payload <- req.as[ListAnswerSheetsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ListAnswerSheetsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "scores" =>
      (for
        payload <- req.as[SaveQuestionScoreAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => SaveQuestionScoreAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "result" =>
      (for
        payload <- req.as[GetStudentExamResultAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => GetStudentExamResultAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "scoreboard" =>
      (for
        payload <- req.as[GetExamScoreboardAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => GetExamScoreboardAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "argues" =>
      (for
        payload <- req.as[CreateArgueTicketAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => CreateArgueTicketAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "argues" / "list" =>
      (for
        payload <- req.as[ListArgueTicketsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ListArgueTicketsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "argues" / "resolve" =>
      (for
        payload <- req.as[ResolveArgueTicketAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ResolveArgueTicketAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "analysis" =>
      (for
        payload <- req.as[GenerateExamAnalysisAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => GenerateExamAnalysisAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "statistics" =>
      (for
        payload <- req.as[GetExamStatisticsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => GetExamStatisticsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "leads" =>
      (for
        payload <- req.as[SubmitEnrollmentLeadAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => SubmitEnrollmentLeadAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "exam" / "leads" / "list" =>
      (for
        payload <- req.as[ListEnrollmentLeadsAPIMessage]
        response <- DatabaseSession.withTransactionConnection(connection => ListEnrollmentLeadsAPIMessage.schema.execute(payload, connection))
        result <- Ok(response.asJson)
      yield result).handleErrorWith(handleError)
  }
