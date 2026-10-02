// 文件说明：后端学习接口实现，用于处理列表查询Quizzes请求并返回类型安全响应。
package microservices.course.learning.api

import microservices.course.learning.tables.QuizTable

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.learning.objects.Quiz
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListQuizzesAPIMessage(
  currentUser: UserProfile
) extends ConnectionAPIMessage[List[Quiz]]:
  override def plan(connection: Connection): IO[List[Quiz]] =
    ListQuizzesAPIMessage.schema.execute(this, connection)

object ListQuizzesAPIMessage:
  val inputDecoder: Decoder[ListQuizzesAPIMessage] = deriveDecoder[ListQuizzesAPIMessage]
  val outputEncoder: Encoder[List[Quiz]] = deriveEncoder[List[Quiz]]
  val schema: ConnectionApiMessageSchema[ListQuizzesAPIMessage, List[Quiz]] = ConnectionApiMessageSchema(
    name = "ListQuizzesAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => listQuizzes(connection, input.currentUser)
  )

  private[learning] def listQuizzes(connection: Connection, currentUser: UserProfile): IO[List[Quiz]] =
    currentUser.role match
      case UserRole.Student =>
        QuizTable.listStudentQuizzes(connection, currentUser.id)
      case _ =>
        QuizTable.listAllSubmittedQuizzes(connection)

  given Decoder[ListQuizzesAPIMessage] = inputDecoder
  given Encoder[ListQuizzesAPIMessage] = deriveEncoder[ListQuizzesAPIMessage]
