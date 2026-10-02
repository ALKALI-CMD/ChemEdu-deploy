// 文件说明：后端学习接口实现，用于处理发布测验请求并返回类型安全响应。
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

final case class PublishQuizAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  title: String,
  durationMinutes: Int,
  objectiveQuestionCount: Int,
  subjectiveQuestionCount: Int,
  drawCount: Option[Int],
  shuffleQuestions: Boolean,
  shuffleOptions: Boolean,
  answerKeys: List[QuizOption],
  questionBank: List[QuizQuestion]
) extends ConnectionAPIMessage[QuizMutationResponse]:
  override def plan(connection: Connection): IO[QuizMutationResponse] =
    PublishQuizAPIMessage.schema.execute(this, connection)



object PublishQuizAPIMessage:
  val inputDecoder: Decoder[PublishQuizAPIMessage] = deriveDecoder[PublishQuizAPIMessage]
  val outputEncoder: Encoder[QuizMutationResponse] = deriveEncoder[QuizMutationResponse]
  val schema: ConnectionApiMessageSchema[PublishQuizAPIMessage, QuizMutationResponse] = ConnectionApiMessageSchema(
    name = "PublishQuizAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(
              new IllegalArgumentException("input.courseId is required for PublishQuizAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- publishQuizForUser(
              connection,
              currentUser,
              PublishQuizInput(
                courseId = resolvedCourseId,
                title = input.title,
                durationMinutes = input.durationMinutes,
                objectiveQuestionCount = input.objectiveQuestionCount,
                subjectiveQuestionCount = input.subjectiveQuestionCount,
                drawCount = input.drawCount,
                shuffleQuestions = input.shuffleQuestions,
                shuffleOptions = input.shuffleOptions,
                answerKeys = input.answerKeys,
                questionBank = input.questionBank
              )
            )
          yield response
  )

  private[learning] def publishQuizForUser(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    input: PublishQuizInput
  ): IO[QuizMutationResponse] =
    SubmitQuizAPIMessage.publishQuizForUser(connection, currentUser, input)

  given Decoder[PublishQuizAPIMessage] = inputDecoder
  given Encoder[PublishQuizAPIMessage] = deriveEncoder[PublishQuizAPIMessage]

