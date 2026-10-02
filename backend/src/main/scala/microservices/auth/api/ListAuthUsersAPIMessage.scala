// 文件说明：后端认证接口实现，用于处理列表查询认证Users请求并返回类型安全响应。
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
import microservices.auth.objects.apiTypes.AuthUsersResponse
import microservices.auth.tables.UserTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListAuthUsersAPIMessage() extends ConnectionAPIMessage[AuthUsersResponse]:
  override def plan(connection: Connection): IO[AuthUsersResponse] =
    UserTable.listUsers(connection).map(AuthUsersResponse(_))

object ListAuthUsersAPIMessage:
  val inputDecoder: Decoder[ListAuthUsersAPIMessage] = deriveDecoder[ListAuthUsersAPIMessage]
  val outputEncoder: Encoder[AuthUsersResponse] = deriveEncoder[AuthUsersResponse]
  val schema: ConnectionApiMessageSchema[ListAuthUsersAPIMessage, AuthUsersResponse] = ConnectionApiMessageSchema(
    name = "ListAuthUsersAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[ListAuthUsersAPIMessage] = inputDecoder
  given Encoder[ListAuthUsersAPIMessage] = deriveEncoder[ListAuthUsersAPIMessage]
