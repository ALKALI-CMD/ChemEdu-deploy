// 文件说明：前端认证接口封装，用于发起列表查询认证Users请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type ListAuthUsersPayload = Record<string, never>

export type AuthUsersResponse = {
  users: UserProfile[]
}

export function createListAuthUsersRequest(): ApiRequest<ListAuthUsersPayload, AuthUsersResponse> {
  return {
    name: 'ListAuthUsersAPIMessage',
    method: 'POST',
    path: '/api/ListAuthUsersAPIMessage',
    payload: {},
  }
}
