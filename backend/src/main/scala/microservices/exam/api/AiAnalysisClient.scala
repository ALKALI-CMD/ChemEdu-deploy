// 文件说明：考试评定域 AI 分析客户端，调用 OpenAI 兼容的 chat completions 接口生成学情分析。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.Json
import io.circe.generic.semiauto.deriveDecoder
import io.circe.parser.parse
import io.circe.syntax.*
import org.http4s.circe.jsonOf
import org.http4s.ember.client.EmberClientBuilder
import org.http4s.{EntityEncoder, Header, Headers, Method, Request, Uri}
import org.typelevel.ci.CIString
import org.typelevel.log4cats.slf4j.Slf4jLogger

import scala.concurrent.duration.*

object AiAnalysisClient:

  private val logger = Slf4jLogger.getLogger[IO]

  final case class AiConfig(
    apiUrl: String,
    apiKey: String,
    model: String
  )

  /** 配置了 AI_API_URL 与 AI_API_KEY 时启用 AI 分析，否则回退到内置规则分析。 */
  def config: Option[AiConfig] =
    for
      apiUrl <- sys.env.get("AI_API_URL").map(_.trim).filter(_.nonEmpty)
      apiKey <- sys.env.get("AI_API_KEY").map(_.trim).filter(_.nonEmpty)
      model = sys.env.getOrElse("AI_API_MODEL", "glm-4-flash").trim
    yield AiConfig(apiUrl, apiKey, model)

  final case class ChatResponse(content: String)

  object ChatResponse:
    given io.circe.Decoder[ChatResponse] = deriveDecoder[ChatResponse]

  private given EntityEncoder[IO, Json] = EntityEncoder[IO, Json]

  /** 调用大模型接口，返回文本内容；未配置或调用失败时返回 None（调用方回退到规则分析）。 */
  def complete(systemPrompt: String, userPrompt: String): IO[Option[String]] =
    config match
      case None => IO.pure(None)
      case Some(aiConfig) =>
        EmberClientBuilder.default[IO].build.use { client =>
          for
            uri <- IO.fromOption(Uri.fromString(aiConfig.apiUrl).toOption)(
              new IllegalArgumentException(s"Invalid AI_API_URL: ${aiConfig.apiUrl}")
            )
            request = Request[IO](
              method = Method.POST,
              uri = uri,
              headers = Headers(
                Header.Raw(CIString("Authorization"), s"Bearer ${aiConfig.apiKey}"),
                Header.Raw(CIString("Content-Type"), "application/json")
              ),
              body = EntityEncoder[IO, Json].toEntity(buildRequestBody(aiConfig.model, systemPrompt, userPrompt)).body
            )
            result <- client
              .expect[ChatResponse](request)(jsonOf[IO, ChatResponse])
              .map(response => Some(response.content))
              .timeout(45.seconds)
              .handleErrorWith { error =>
                logger.warn(error)("AI analysis request failed, falling back to heuristic analysis.").as(None)
              }
          yield result
        }

  private def buildRequestBody(model: String, systemPrompt: String, userPrompt: String): Json =
    Json.obj(
      "model" -> model.asJson,
      "temperature" -> Json.fromDoubleOrNull(0.3),
      "messages" -> Json.arr(
        Json.obj("role" -> "system".asJson, "content" -> systemPrompt.asJson),
        Json.obj("role" -> "user".asJson, "content" -> userPrompt.asJson)
      )
    )

  /** 从大模型返回文本中提取 JSON 对象（容忍 ```json 代码块包裹）。 */
  def extractJson(text: String): Option[Json] =
    val trimmed = text.trim
    val withoutFence =
      if trimmed.startsWith("```") then
        trimmed.stripPrefix("```json").stripPrefix("```").stripSuffix("```").trim
      else trimmed
    parse(withoutFence).toOption.orElse {
      val start = withoutFence.indexOf('{')
      val end = withoutFence.lastIndexOf('}')
      if start >= 0 && end > start then parse(withoutFence.substring(start, end + 1)).toOption
      else None
    }
