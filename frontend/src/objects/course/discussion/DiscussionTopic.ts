// 文件说明：定义课程讨论讨论Topic领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import type { DiscussionReply } from '@/objects/course/discussion/DiscussionReply'
import type { DiscussionTeacherHighlight } from '@/objects/course/discussion/DiscussionTeacherHighlight'
import type { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

export type DiscussionTopic = {
  id: string
  courseId: string
  authorId: UserId
  title: string
  author: string
  authorRole: UserRole
  content: string
  replyCount: number
  createdAt: string
  updatedAt?: string
  lastReplyAt: string
  lessonId?: string
  lessonTitle?: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  visibility: DiscussionVisibility
  threadState: DiscussionThreadState
  pinState: DiscussionPinState
  moderatedBy?: string
  moderatedAt?: string
  moderationNote?: string
  teacherHighlights: DiscussionTeacherHighlight[]
  heatScore: number
  likeCount: number
  favoriteCount: number
  reportCount: number
  mentionUserIds: UserId[]
  sensitiveHitCount: number
  likedByCurrentUser: boolean
  favoritedByCurrentUser: boolean
  reportedByCurrentUser: boolean
  replies: DiscussionReply[]
}
