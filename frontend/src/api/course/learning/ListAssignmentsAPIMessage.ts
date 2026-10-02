// 文件说明：前端学习接口封装，用于发起列表查询Assignments请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Assignment } from '@/objects/course/learning/Assignment'

export type ListAssignmentsPayload = {
  currentUser: UserProfile
}

export function createListAssignmentsRequest(
  currentUser: UserProfile,
): ApiRequest<ListAssignmentsPayload, Assignment[]> {
  return {
    name: 'ListAssignmentsAPIMessage',
    method: 'POST',
    path: '/api/ListAssignmentsAPIMessage',
    payload: { currentUser },
  }
}
