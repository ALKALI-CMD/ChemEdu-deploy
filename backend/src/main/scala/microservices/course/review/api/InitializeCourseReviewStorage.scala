// 文件说明：初始化课程评价相关存储或基础数据的接口定义。
package microservices.course.review.api

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
import microservices.course.review.tables.ReviewTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeCourseReviewStorage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    ReviewTable.initialize(connection).as(MessageResponse("Course review storage initialized."))

object InitializeCourseReviewStorage:
  val inputDecoder: Decoder[InitializeCourseReviewStorage] = deriveDecoder[InitializeCourseReviewStorage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeCourseReviewStorage, MessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeCourseReviewStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeCourseReviewStorage] = inputDecoder
  given Encoder[InitializeCourseReviewStorage] = deriveEncoder[InitializeCourseReviewStorage]
