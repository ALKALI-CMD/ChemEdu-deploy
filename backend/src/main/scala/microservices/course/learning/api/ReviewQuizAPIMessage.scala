// 文件说明：后端学习接口实现，用于处理评价/批改测验请求并返回类型安全响应。
package microservices.course.learning.api



import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.admin.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

import java.sql.Connection

final case class ReviewQuizAPIMessage(
  sessionToken: String,
  quizId: Option[String],
  subjectiveScore: Int,
  feedback: Option[String]
) extends ConnectionAPIMessage[QuizMutationResponse]:
  override def plan(connection: Connection): IO[QuizMutationResponse] =
    ReviewQuizAPIMessage.schema.execute(this, connection)



object ReviewQuizAPIMessage:
  val inputDecoder: Decoder[ReviewQuizAPIMessage] = deriveDecoder[ReviewQuizAPIMessage]
  val outputEncoder: Encoder[QuizMutationResponse] = deriveEncoder[QuizMutationResponse]
  val schema: ConnectionApiMessageSchema[ReviewQuizAPIMessage, QuizMutationResponse] = ConnectionApiMessageSchema(
    name = "ReviewQuizAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedQuizId <- IO.fromOption(input.quizId)(
              new IllegalArgumentException("input.quizId is required for ReviewQuizAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- reviewQuizForUser(
              connection,
              currentUser,
              ReviewQuizInput(
                quizId = resolvedQuizId,
                subjectiveScore = input.subjectiveScore,
                feedback = input.feedback
              )
            )
          yield response
  )

  private[learning] def reviewQuizForUser(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    input: ReviewQuizInput
  ): IO[QuizMutationResponse] =
    SubmitQuizAPIMessage.reviewQuizForUser(connection, currentUser, input)

  given Decoder[ReviewQuizAPIMessage] = inputDecoder
  given Encoder[ReviewQuizAPIMessage] = deriveEncoder[ReviewQuizAPIMessage]

