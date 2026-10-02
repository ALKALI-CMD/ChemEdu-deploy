// 文件说明：定义系统示例Note状态领域数据类型，用于业务流程和接口传输。
package system.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

import java.time.Instant
import java.util.UUID
import scala.util.Try

enum NoteStatus:
  case Draft
  case Published

object NoteStatus:

  def toString(status: NoteStatus): String =
    status match
      case NoteStatus.Draft => "draft"
      case NoteStatus.Published => "published"

  def fromString(value: String): Either[String, NoteStatus] =
    value.trim.toLowerCase match
      case "draft" => Right(NoteStatus.Draft)
      case "published" => Right(NoteStatus.Published)
      case other => Left(s"Unsupported NoteStatus value: $other")

  given Encoder[NoteStatus] = Encoder.encodeString.contramap(toString)
  given Decoder[NoteStatus] = Decoder.decodeString.emap(fromString)

