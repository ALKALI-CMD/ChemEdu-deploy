// 文件说明：前端课程讨论接口封装，用于发起切换讨论互动反应请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type ToggleDiscussionReactionPayload = {
  sessionToken: SessionToken
  topicId: string
  reactionType: 'like' | 'favorite' | 'report'
}

export function createToggleDiscussionReactionRequest(
  sessionToken: SessionToken,
  topicId: string,
  reactionType: 'like' | 'favorite' | 'report',
): ApiRequest<ToggleDiscussionReactionPayload, DiscussionTopic> {
  return {
    name: 'ToggleDiscussionReactionAPIMessage',
    method: 'POST',
    path: `/api/v1/discussions/${topicId}/reactions`,
    payload: {
      sessionToken,
      topicId,
      reactionType,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
