// 文件说明：前端课程讨论接口封装，用于发起删除讨论Topic请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type DeleteDiscussionTopicPayload = {
  sessionToken: SessionToken
  topicId: string
}

export function createDeleteDiscussionTopicRequest(
  sessionToken: SessionToken,
  topicId: string,
): ApiRequest<DeleteDiscussionTopicPayload, string> {
  return {
    name: 'DeleteDiscussionTopicAPIMessage',
    method: 'DELETE',
    path: `/api/v1/discussions/${topicId}`,
    payload: {
      sessionToken,
      topicId,
    },
    parseResponse: parseEntityResponse<'topicId', string>('topicId'),
  }
}
