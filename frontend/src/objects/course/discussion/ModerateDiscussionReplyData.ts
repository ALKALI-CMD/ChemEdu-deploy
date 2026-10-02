// 文件说明：定义课程讨论管理讨论Reply领域数据类型，用于业务流程和接口传输。
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

export type ModerateDiscussionReplyData = {
  replyId: string
  visibility: DiscussionVisibility
  moderationNote?: string
}
