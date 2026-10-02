// 文件说明：考试评定域存储初始化接口定义，启动时创建表结构并填充演示数据。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.catalog.objects.apiTypes.MessageResponse
import microservices.exam.tables.{ExamSeedData, ExamTableInitializer}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeExamStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    for
      _ <- ExamTableInitializer.initialize(connection)
    yield MessageResponse("Exam storage initialized.")

object InitializeExamStorage:
  def seedSamples(connection: Connection): IO[Unit] =
    ExamSeedData.seedIfEmpty(connection)

  val inputDecoder: Decoder[InitializeExamStorage] = deriveDecoder[InitializeExamStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeExamStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeExamStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeExamStorage] = inputDecoder
  given Encoder[InitializeExamStorage] = deriveEncoder[InitializeExamStorage]
