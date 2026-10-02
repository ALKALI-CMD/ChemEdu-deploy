// 文件说明：前端课程讨论接口封装，用于发起列表查询平台Reports请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'

export type ListPlatformReportsPayload = {
  sessionToken: SessionToken
}

export function createListPlatformReportsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListPlatformReportsPayload, PlatformReport[]> {
  return {
    name: 'ListPlatformReportsAPIMessage',
    method: 'POST',
    path: '/api/ListPlatformReportsAPIMessage',
    payload: { sessionToken },
  }
}
