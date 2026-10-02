// 文件说明：定义课程讨论讨论PinState领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}

enum DiscussionPinState(val entryName: String):
  case Normal extends DiscussionPinState("normal")
  case Pinned extends DiscussionPinState("pinned")

object DiscussionPinState:
  given Encoder[DiscussionPinState] = Encoder.encodeString.contramap(_.entryName)
  given Decoder[DiscussionPinState] = Decoder.decodeString.emap(value =>
    DiscussionPinState.values.find(_.entryName == value.trim.toLowerCase).toRight(s"Unknown DiscussionPinState: $value")
  )
