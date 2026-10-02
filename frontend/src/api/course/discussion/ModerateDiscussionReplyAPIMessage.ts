// 文件说明：前端课程讨论接口封装，用于发起管理讨论Reply请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

export type ModerateDiscussionReplyPayload = {
  sessionToken: SessionToken
  replyId: string
  visibility: DiscussionVisibility
  moderationNote?: string
}

export function createModerateDiscussionReplyRequest(
  sessionToken: SessionToken,
  replyId: string,
  visibility: DiscussionVisibility,
  moderationNote?: string,
): ApiRequest<ModerateDiscussionReplyPayload, DiscussionTopic> {
  return {
    name: 'ModerateDiscussionReplyAPIMessage',
    method: 'PATCH',
    path: `/api/v1/discussion-replies/${replyId}/moderation`,
    payload: {
      sessionToken,
      replyId,
      visibility,
      moderationNote,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
