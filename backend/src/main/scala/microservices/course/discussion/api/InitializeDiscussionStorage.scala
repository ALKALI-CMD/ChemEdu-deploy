// 文件说明：初始化课程讨论相关存储或基础数据的接口定义。
package microservices.course.discussion.api

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
import microservices.course.discussion.tables.DiscussionTableInitializer
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeDiscussionStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    DiscussionTableInitializer.initialize(connection).as(MessageResponse("Discussion storage initialized."))

object InitializeDiscussionStorage:
  val inputDecoder: Decoder[InitializeDiscussionStorage] = deriveDecoder[InitializeDiscussionStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeDiscussionStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeDiscussionStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeDiscussionStorage] = inputDecoder
  given Encoder[InitializeDiscussionStorage] = deriveEncoder[InitializeDiscussionStorage]
