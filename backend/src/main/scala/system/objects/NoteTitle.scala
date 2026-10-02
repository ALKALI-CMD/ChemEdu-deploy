// 文件说明：定义系统示例NoteTitle领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

import java.time.Instant
import java.util.UUID
import scala.util.Try

final case class NoteTitle(value: String)

object NoteTitle:
  given Encoder[NoteTitle] = Encoder.encodeString.contramap(_.value)
  given Decoder[NoteTitle] = Decoder.decodeString.map(NoteTitle(_))

