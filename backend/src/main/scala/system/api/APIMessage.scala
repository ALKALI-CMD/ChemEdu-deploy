// 文件说明：后端系统示例接口实现，用于处理API请求并返回类型安全响应。
package system.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}

import java.sql.Connection

abstract class ConnectionAPIMessage[Response]:
  def plan(connection: Connection): IO[Response]

abstract class PlainAPIMessage[Response]:
  def plan(): IO[Response]

final case class PlainApiMessageSchema[Input, Output](
  name: String,
  inputDecoder: Decoder[Input],
  outputEncoder: Encoder[Output],
  execute: Input => IO[Output]
)

final case class ConnectionApiMessageSchema[Input, Output](
  name: String,
  inputDecoder: Decoder[Input],
  outputEncoder: Encoder[Output],
  execute: (Input, Connection) => IO[Output]
)
