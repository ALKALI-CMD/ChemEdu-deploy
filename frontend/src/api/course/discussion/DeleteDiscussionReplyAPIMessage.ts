// 文件说明：前端课程讨论接口封装，用于发起删除讨论Reply请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type DeleteDiscussionReplyPayload = {
  sessionToken: SessionToken
  replyId: string
}

export function createDeleteDiscussionReplyRequest(
  sessionToken: SessionToken,
  replyId: string,
): ApiRequest<DeleteDiscussionReplyPayload, DiscussionTopic> {
  return {
    name: 'DeleteDiscussionReplyAPIMessage',
    method: 'DELETE',
    path: `/api/v1/discussion-replies/${replyId}`,
    payload: {
      sessionToken,
      replyId,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
