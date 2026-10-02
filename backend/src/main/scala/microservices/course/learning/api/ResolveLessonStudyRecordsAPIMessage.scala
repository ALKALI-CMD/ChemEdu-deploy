// 文件说明：后端学习接口实现，用于处理解析课时StudyRecords请求并返回类型安全响应。
package microservices.course.learning.api


import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.UserProfile
import microservices.course.learning.objects.LessonStudyRecord
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ResolveLessonStudyRecordsAPIMessage(
  currentUser: UserProfile
) extends ConnectionAPIMessage[Map[String, LessonStudyRecord]]:
  override def plan(connection: Connection): IO[Map[String, LessonStudyRecord]] =
    ResolveLessonStudyRecordsAPIMessage.schema.execute(this, connection)

object ResolveLessonStudyRecordsAPIMessage:
  val inputDecoder: Decoder[ResolveLessonStudyRecordsAPIMessage] = deriveDecoder[ResolveLessonStudyRecordsAPIMessage]
  val outputEncoder: Encoder[Map[String, LessonStudyRecord]] = Encoder.encodeMap[String, LessonStudyRecord]
  val schema: ConnectionApiMessageSchema[ResolveLessonStudyRecordsAPIMessage, Map[String, LessonStudyRecord]] = ConnectionApiMessageSchema(
    name = "ResolveLessonStudyRecordsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => resolveLessonStudyRecords(connection, input.currentUser)
  )

  private[learning] def resolveLessonStudyRecords(connection: Connection, currentUser: UserProfile): IO[Map[String, LessonStudyRecord]] =
    UpdateLessonProgressAPIMessage.resolveLessonStudyRecords(connection, currentUser)

  given Decoder[ResolveLessonStudyRecordsAPIMessage] = inputDecoder
  given Encoder[ResolveLessonStudyRecordsAPIMessage] = deriveEncoder[ResolveLessonStudyRecordsAPIMessage]
