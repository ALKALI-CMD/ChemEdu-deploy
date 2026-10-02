// 文件说明：前端课程讨论接口封装，用于发起管理讨论Topic请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import type { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

export type ModerateDiscussionTopicPayload = {
  sessionToken: SessionToken
  topicId: string
  visibility: DiscussionVisibility
  threadState: DiscussionThreadState
  pinState: DiscussionPinState
  resolved: boolean
  moderationNote?: string
}

export function createModerateDiscussionTopicRequest(
  sessionToken: SessionToken,
  topicId: string,
  visibility: DiscussionVisibility,
  threadState: DiscussionThreadState,
  pinState: DiscussionPinState,
  resolved: boolean,
  moderationNote?: string,
): ApiRequest<ModerateDiscussionTopicPayload, DiscussionTopic> {
  return {
    name: 'ModerateDiscussionTopicAPIMessage',
    method: 'PATCH',
    path: `/api/v1/discussions/${topicId}/moderation`,
    payload: {
      sessionToken,
      topicId,
      visibility,
      threadState,
      pinState,
      resolved,
      moderationNote,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
