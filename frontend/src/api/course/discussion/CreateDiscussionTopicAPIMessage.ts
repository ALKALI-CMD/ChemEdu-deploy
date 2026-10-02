// 文件说明：前端课程讨论接口封装，用于发起创建讨论Topic请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type CreateDiscussionTopicPayload = {
  sessionToken: SessionToken
  courseId: string
  lessonId: string | undefined
  title: string
  content: string
}

export function createDiscussionTopicRequest(
  sessionToken: SessionToken,
  courseId: string,
  lessonId: string | undefined,
  title: string,
  content: string,
): ApiRequest<CreateDiscussionTopicPayload, DiscussionTopic> {
  return {
    name: 'CreateDiscussionTopicAPIMessage',
    method: 'POST',
    path: `/api/v1/courses/${courseId}/discussions`,
    payload: {
      sessionToken,
      courseId,
      lessonId,
      title,
      content,
    },
    parseResponse: parseEntityResponse<'discussion', DiscussionTopic>('discussion'),
  }
}
