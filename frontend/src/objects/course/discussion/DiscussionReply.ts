// 文件说明：定义课程讨论讨论Reply领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

export type DiscussionReply = {
  id: string
  topicId: string
  authorId: UserId
  author: string
  authorRole: UserRole
  content: string
  createdAt: string
  updatedAt?: string
  visibility: DiscussionVisibility
  moderatedBy?: string
  moderatedAt?: string
  moderationNote?: string
}
