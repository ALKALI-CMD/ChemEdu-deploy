// 文件说明：初始化管理端相关存储或基础数据的接口定义。
package microservices.admin.api

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
import microservices.admin.tables.AdminTableInitializer
import microservices.course.catalog.objects.apiTypes.MessageResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeAdminStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    AdminTableInitializer.initialize(connection).as(MessageResponse("Admin storage initialized."))

object InitializeAdminStorage:
  def seedSamples(connection: Connection): IO[Unit] =
    AdminTableInitializer.seedSamples(connection)

  val inputDecoder: Decoder[InitializeAdminStorage] = deriveDecoder[InitializeAdminStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeAdminStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeAdminStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeAdminStorage] = inputDecoder
  given Encoder[InitializeAdminStorage] = deriveEncoder[InitializeAdminStorage]
