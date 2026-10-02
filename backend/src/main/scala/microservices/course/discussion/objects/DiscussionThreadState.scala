// 文件说明：定义课程讨论讨论ThreadState领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}

enum DiscussionThreadState(val entryName: String):
  case Open extends DiscussionThreadState("open")
  case Locked extends DiscussionThreadState("locked")

object DiscussionThreadState:
  given Encoder[DiscussionThreadState] = Encoder.encodeString.contramap(_.entryName)
  given Decoder[DiscussionThreadState] = Decoder.decodeString.emap(value =>
    DiscussionThreadState.values.find(_.entryName == value.trim.toLowerCase).toRight(s"Unknown DiscussionThreadState: $value")
  )
