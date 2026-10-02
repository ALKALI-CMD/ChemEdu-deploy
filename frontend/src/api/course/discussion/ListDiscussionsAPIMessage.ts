// 文件说明：前端课程讨论接口封装，用于发起列表查询Discussions请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type ListDiscussionsPayload = {
  sessionToken: SessionToken
}

export function createListDiscussionsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListDiscussionsPayload, DiscussionTopic[]> {
  return {
    name: 'ListDiscussionsAPIMessage',
    method: 'POST',
    path: '/api/ListDiscussionsAPIMessage',
    payload: { sessionToken },
  }
}
