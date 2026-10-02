// 文件说明：后端课程目录接口实现，用于处理Seed课程课程目录DataIfNeeded请求并返回类型安全响应。
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

final case class SeedCourseCatalogDataIfNeededAPIMessage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    CourseTable.seedInitialDataIfNeeded(connection).as(MessageResponse("Course catalog seed data checked."))

object SeedCourseCatalogDataIfNeededAPIMessage:
  val inputDecoder: Decoder[SeedCourseCatalogDataIfNeededAPIMessage] = deriveDecoder[SeedCourseCatalogDataIfNeededAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[SeedCourseCatalogDataIfNeededAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "SeedCourseCatalogDataIfNeededAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[SeedCourseCatalogDataIfNeededAPIMessage] = inputDecoder
  given Encoder[SeedCourseCatalogDataIfNeededAPIMessage] = deriveEncoder[SeedCourseCatalogDataIfNeededAPIMessage]
