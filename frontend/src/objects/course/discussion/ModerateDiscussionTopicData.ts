// 文件说明：定义课程讨论管理讨论Topic领域数据类型，用于业务流程和接口传输。
import type { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import type { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

export type ModerateDiscussionTopicData = {
  topicId: string
  visibility: DiscussionVisibility
  threadState: DiscussionThreadState
  pinState: DiscussionPinState
  resolved: boolean
  moderationNote?: string
}
