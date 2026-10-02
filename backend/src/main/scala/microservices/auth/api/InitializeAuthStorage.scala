// 文件说明：初始化认证相关存储或基础数据的接口定义。
package microservices.auth.api

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
import microservices.auth.tables.{UserSessionTableInitializer, UserTableInitializer}
import microservices.course.catalog.objects.apiTypes.MessageResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeAuthStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    for
      _ <- UserTableInitializer.initialize(connection)
      _ <- UserSessionTableInitializer.initialize(connection)
    yield MessageResponse("Auth storage initialized.")

object InitializeAuthStorage:
  val inputDecoder: Decoder[InitializeAuthStorage] = deriveDecoder[InitializeAuthStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeAuthStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeAuthStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeAuthStorage] = inputDecoder
  given Encoder[InitializeAuthStorage] = deriveEncoder[InitializeAuthStorage]
