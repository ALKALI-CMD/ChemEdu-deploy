// 文件说明：初始化学习相关存储或基础数据的接口定义。
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
import microservices.course.catalog.objects.apiTypes.MessageResponse
import microservices.course.learning.tables.LearningTableInitializer
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeLearningStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    LearningTableInitializer.initialize(connection).as(MessageResponse("Learning storage initialized."))

object InitializeLearningStorage:
  def seedSamples(connection: Connection): IO[Unit] =
    LearningTableInitializer.seedSamples(connection)

  val inputDecoder: Decoder[InitializeLearningStorage] = deriveDecoder[InitializeLearningStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeLearningStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeLearningStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeLearningStorage] = inputDecoder
  given Encoder[InitializeLearningStorage] = deriveEncoder[InitializeLearningStorage]
