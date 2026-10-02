// 文件说明：定义课程讨论讨论教师Highlight领域数据类型，用于业务流程和接口传输。
import type { UserRole } from '@/objects/auth/UserRole'

export type DiscussionTeacherHighlight = {
  id: string
  author: string
  authorRole: UserRole
  content: string
  createdAt: string
  sourceType: 'topic' | 'reply' | 'moderation' | string
}
