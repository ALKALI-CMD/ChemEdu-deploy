// 文件说明：后端系统示例接口实现，用于处理新增或更新DemoNote请求并返回类型安全响应。
package system.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import org.typelevel.log4cats.slf4j.Slf4jLogger
import system.objects.{DemoNote, NoteBody, NoteStatus, NoteTitle}
import system.tables.NoteTable

import java.sql.Connection

final case class UpsertDemoNoteAPIMessage(
  title: NoteTitle,
  body: NoteBody,
  status: NoteStatus
) extends ConnectionAPIMessage[DemoNote]:
  override def plan(connection: Connection): IO[DemoNote] =
    UpsertDemoNoteAPIMessage.schema.execute(this, connection)

object UpsertDemoNoteAPIMessage:
  val inputDecoder: Decoder[UpsertDemoNoteAPIMessage] = deriveDecoder[UpsertDemoNoteAPIMessage]
  val outputEncoder: Encoder[DemoNote] = deriveEncoder[DemoNote]
  val schema: ConnectionApiMessageSchema[UpsertDemoNoteAPIMessage, DemoNote] = ConnectionApiMessageSchema(
    name = "UpsertDemoNoteAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      val logger = Slf4jLogger.getLogger[IO]
      for
        _ <- logger.info(s"UpsertDemoNoteAPIMessage started, title=${input.title}")
        note <- NoteTable.insert(connection, input.title, input.body, input.status)
        _ <- logger.info(s"UpsertDemoNoteAPIMessage finished, noteId=${note.id}")
      yield note
  )
  given Decoder[UpsertDemoNoteAPIMessage] = inputDecoder
  given Encoder[UpsertDemoNoteAPIMessage] = deriveEncoder[UpsertDemoNoteAPIMessage]
