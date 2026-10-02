// 文件说明：定义系统示例DemoNote领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

import java.time.Instant
import scala.util.Try

final case class DemoNote(
  id: NoteId,
  title: NoteTitle,
  body: NoteBody,
  status: NoteStatus,
  createdAt: Instant
)

object DemoNote:
  given Encoder[Instant] = Encoder.encodeString.contramap(_.toString)
  given Decoder[Instant] = Decoder.decodeString.emap { value =>
    Try(Instant.parse(value)).toEither.left.map(_.getMessage)
  }

  given Encoder[DemoNote] = deriveEncoder[DemoNote]
  given Decoder[DemoNote] = deriveDecoder[DemoNote]
