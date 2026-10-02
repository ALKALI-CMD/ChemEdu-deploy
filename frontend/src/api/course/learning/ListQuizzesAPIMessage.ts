// 文件说明：前端学习接口封装，用于发起列表查询Quizzes请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Quiz } from '@/objects/course/learning/Quiz'

export type ListQuizzesPayload = {
  currentUser: UserProfile
}

export function createListQuizzesRequest(
  currentUser: UserProfile,
): ApiRequest<ListQuizzesPayload, Quiz[]> {
  return {
    name: 'ListQuizzesAPIMessage',
    method: 'POST',
    path: '/api/ListQuizzesAPIMessage',
    payload: { currentUser },
  }
}
