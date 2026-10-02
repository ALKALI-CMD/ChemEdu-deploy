// 文件说明：后端系统示例接口实现，用于处理回显请求并返回类型安全响应。
package system.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import org.typelevel.log4cats.slf4j.Slf4jLogger
import system.objects.EchoResponse

final case class EchoAPIMessage(
  message: String,
  uppercase: Boolean
) extends PlainAPIMessage[EchoResponse]:
  override def plan(): IO[EchoResponse] =
    EchoAPIMessage.schema.execute(this)

object EchoAPIMessage:
  val inputDecoder: Decoder[EchoAPIMessage] = deriveDecoder[EchoAPIMessage]
  val outputEncoder: Encoder[EchoResponse] = deriveEncoder[EchoResponse]
  val schema: PlainApiMessageSchema[EchoAPIMessage, EchoResponse] = PlainApiMessageSchema(
    name = "EchoAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = input =>
      val logger = Slf4jLogger.getLogger[IO]
      for
        _ <- logger.info(s"EchoAPIMessage started, message=${input.message}")
        response = EchoResponse(
          message = if input.uppercase then input.message.toUpperCase else input.message,
          transformed = input.uppercase
        )
        _ <- logger.info("EchoAPIMessage finished")
      yield response
  )
  given Decoder[EchoAPIMessage] = inputDecoder
  given Encoder[EchoAPIMessage] = deriveEncoder[EchoAPIMessage]
