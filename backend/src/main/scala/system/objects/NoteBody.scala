// 文件说明：定义系统示例NoteBody领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

import java.time.Instant
import java.util.UUID
import scala.util.Try

final case class NoteBody(value: String)

object NoteBody:
  given Encoder[NoteBody] = Encoder.encodeString.contramap(_.value)
  given Decoder[NoteBody] = Decoder.decodeString.map(NoteBody(_))

