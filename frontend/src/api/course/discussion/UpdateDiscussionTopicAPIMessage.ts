// 文件说明：前端课程讨论接口封装，用于发起更新讨论Topic请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type UpdateDiscussionTopicPayload = {
  sessionToken: SessionToken
  topicId: string
  title: string
  content: string
}

export function createUpdateDiscussionTopicRequest(
  sessionToken: SessionToken,
  topicId: string,
  title: string,
  content: string,
): ApiRequest<UpdateDiscussionTopicPayload, DiscussionTopic> {
  return {
    name: 'UpdateDiscussionTopicAPIMessage',
    method: 'PUT',
    path: `/api/v1/discussions/${topicId}`,
    payload: {
      sessionToken,
      topicId,
      title,
      content,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
