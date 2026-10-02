// 文件说明：初始化课程目录相关存储或基础数据的接口定义。
package microservices.course.catalog.api

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
import microservices.course.catalog.tables.CourseTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeCourseCatalogStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    CourseTable.initialize(connection).as(MessageResponse("Course catalog storage initialized."))

object InitializeCourseCatalogStorage:
  val inputDecoder: Decoder[InitializeCourseCatalogStorage] = deriveDecoder[InitializeCourseCatalogStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeCourseCatalogStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeCourseCatalogStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeCourseCatalogStorage] = inputDecoder
  given Encoder[InitializeCourseCatalogStorage] = deriveEncoder[InitializeCourseCatalogStorage]
