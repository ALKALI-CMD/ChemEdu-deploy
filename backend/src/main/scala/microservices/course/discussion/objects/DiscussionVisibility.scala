// 文件说明：定义课程讨论讨论Visibility领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}

enum DiscussionVisibility(val entryName: String):
  case Visible extends DiscussionVisibility("visible")
  case Hidden extends DiscussionVisibility("hidden")

object DiscussionVisibility:
  given Encoder[DiscussionVisibility] = Encoder.encodeString.contramap(_.entryName)
  given Decoder[DiscussionVisibility] = Decoder.decodeString.emap(value =>
    DiscussionVisibility.values.find(_.entryName == value.trim.toLowerCase).toRight(s"Unknown DiscussionVisibility: $value")
  )
