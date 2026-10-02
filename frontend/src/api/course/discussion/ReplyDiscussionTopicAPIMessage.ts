// 文件说明：前端课程讨论接口封装，用于发起Reply讨论Topic请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type ReplyDiscussionTopicPayload = {
  sessionToken: SessionToken
  topicId: string
  content: string
}

export function createReplyDiscussionTopicRequest(
  sessionToken: SessionToken,
  topicId: string,
  content: string,
): ApiRequest<ReplyDiscussionTopicPayload, DiscussionTopic> {
  return {
    name: 'ReplyDiscussionTopicAPIMessage',
    method: 'POST',
    path: `/api/v1/discussions/${topicId}/replies`,
    payload: {
      sessionToken,
      topicId,
      content,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
