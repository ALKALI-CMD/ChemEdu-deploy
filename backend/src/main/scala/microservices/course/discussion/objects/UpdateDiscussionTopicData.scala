// 文件说明：定义课程讨论更新讨论Topic领域数据类型，用于业务流程和接口传输。
package microservices.course.discussion.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.auth.objects.*
import microservices.admin.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

final case class UpdateDiscussionTopicData(
  topicId: String,
  title: String,
  content: String
)

object UpdateDiscussionTopicData:
  given Decoder[UpdateDiscussionTopicData] = deriveDecoder[UpdateDiscussionTopicData]
  given Encoder[UpdateDiscussionTopicData] = deriveEncoder[UpdateDiscussionTopicData]

