package microservices.course.discussion.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.discussion.api.*
import microservices.course.discussion.objects.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*

import system.routes.RouteSupport.*

object DiscussionRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "v1" / "courses" / courseId / "discussions" =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received POST /api/v1/courses/$courseId/discussions")
          payload <- req.as[CreateDiscussionTopicAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            CreateDiscussionTopicAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "discussions" / topicId / "replies" =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received POST /api/v1/discussions/$topicId/replies")
          payload <- req.as[ReplyDiscussionTopicAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            ReplyDiscussionTopicAPIMessage.schema.execute(payload.copy(topicId = Some(topicId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "discussions" / topicId =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received PUT /api/v1/discussions/$topicId")
          payload <- req.as[UpdateDiscussionTopicAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            UpdateDiscussionTopicAPIMessage.schema.execute(payload.copy(topicId = Some(topicId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "discussions" / topicId =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received DELETE /api/v1/discussions/$topicId")
          payload <- req.as[DeleteDiscussionTopicAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            DeleteDiscussionTopicAPIMessage.schema.execute(payload.copy(topicId = Some(topicId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "discussions" / topicId / "moderation" =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received PATCH /api/v1/discussions/$topicId/moderation")
          payload <- req.as[ModerateDiscussionTopicAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            ModerateDiscussionTopicAPIMessage.schema.execute(payload.copy(topicId = Some(topicId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "discussions" / topicId / "reactions" =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received POST /api/v1/discussions/$topicId/reactions")
          payload <- req.as[ToggleDiscussionReactionAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            ToggleDiscussionReactionAPIMessage.schema.execute(payload.copy(topicId = Some(topicId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "discussion-replies" / replyId =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received PUT /api/v1/discussion-replies/$replyId")
          payload <- req.as[UpdateDiscussionReplyAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            UpdateDiscussionReplyAPIMessage.schema.execute(payload.copy(replyId = Some(replyId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "discussion-replies" / replyId =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received DELETE /api/v1/discussion-replies/$replyId")
          payload <- req.as[DeleteDiscussionReplyAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            DeleteDiscussionReplyAPIMessage.schema.execute(payload.copy(replyId = Some(replyId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "discussion-replies" / replyId / "moderation" =>
      (
        for
          _ <- logger.info(s"DiscussionRoutes received PATCH /api/v1/discussion-replies/$replyId/moderation")
          payload <- req.as[ModerateDiscussionReplyAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection =>
            ModerateDiscussionReplyAPIMessage.schema.execute(payload.copy(replyId = Some(replyId)), connection)
          )
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }


