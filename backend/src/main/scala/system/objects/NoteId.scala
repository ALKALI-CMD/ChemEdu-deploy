// 文件说明：定义系统示例NoteId领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

import java.time.Instant
import java.util.UUID
import scala.util.Try

final case class NoteId(value: UUID)

object NoteId:
  given Encoder[NoteId] = Encoder.encodeString.contramap(_.value.toString)

  given Decoder[NoteId] = Decoder.decodeString.emap { value =>
    Try(UUID.fromString(value)).toEither.left.map(_.getMessage).map(NoteId(_))
  }

