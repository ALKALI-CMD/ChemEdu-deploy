// 文件说明：前端管理端接口封装，用于发起删除专业请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type DeleteMajorPayload = {
  sessionToken: SessionToken
}

export function createDeleteMajorRequest(sessionToken: SessionToken, majorId: string): ApiRequest<DeleteMajorPayload, string> {
  return {
    name: 'DeleteMajorAPIMessage',
    method: 'DELETE',
    path: `/api/v1/admin/majors/${majorId}`,
    payload: { sessionToken },
    parseResponse: parseMessageText,
  }
}
