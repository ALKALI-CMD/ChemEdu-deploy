// 文件说明：前端课程讨论接口封装，用于发起更新讨论Reply请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type UpdateDiscussionReplyPayload = {
  sessionToken: SessionToken
  replyId: string
  content: string
}

export function createUpdateDiscussionReplyRequest(
  sessionToken: SessionToken,
  replyId: string,
  content: string,
): ApiRequest<UpdateDiscussionReplyPayload, DiscussionTopic> {
  return {
    name: 'UpdateDiscussionReplyAPIMessage',
    method: 'PUT',
    path: `/api/v1/discussion-replies/${replyId}`,
    payload: {
      sessionToken,
      replyId,
      content,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
