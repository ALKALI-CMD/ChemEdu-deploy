// 文件说明：定义考试评定域答题卡改题区域领域数据类型，坐标为 0-1 归一化值。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 答题卡改题区域：x/y/w/h 均为相对答题卡图片的归一化坐标（0-1），同一考试所有答题卡共用。 */
final case class GradingRegion(
  x: Double,
  y: Double,
  w: Double,
  h: Double
)

object GradingRegion:
  given Decoder[GradingRegion] = deriveDecoder[GradingRegion]
  given Encoder[GradingRegion] = deriveEncoder[GradingRegion]
