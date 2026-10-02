// 文件说明：后端学习接口实现，用于处理解析课时进度请求并返回类型安全响应。
package microservices.course.learning.api


import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.UserProfile
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ResolveLessonProgressAPIMessage(
  currentUser: UserProfile
) extends ConnectionAPIMessage[Map[String, Boolean]]:
  override def plan(connection: Connection): IO[Map[String, Boolean]] =
    ResolveLessonProgressAPIMessage.schema.execute(this, connection)

object ResolveLessonProgressAPIMessage:
  val inputDecoder: Decoder[ResolveLessonProgressAPIMessage] = deriveDecoder[ResolveLessonProgressAPIMessage]
  val outputEncoder: Encoder[Map[String, Boolean]] = Encoder.encodeMap[String, Boolean]
  val schema: ConnectionApiMessageSchema[ResolveLessonProgressAPIMessage, Map[String, Boolean]] = ConnectionApiMessageSchema(
    name = "ResolveLessonProgressAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => resolveLessonProgress(connection, input.currentUser)
  )

  private[learning] def resolveLessonProgress(connection: Connection, currentUser: UserProfile): IO[Map[String, Boolean]] =
    UpdateLessonProgressAPIMessage.resolveLessonProgress(connection, currentUser)

  given Decoder[ResolveLessonProgressAPIMessage] = inputDecoder
  given Encoder[ResolveLessonProgressAPIMessage] = deriveEncoder[ResolveLessonProgressAPIMessage]
