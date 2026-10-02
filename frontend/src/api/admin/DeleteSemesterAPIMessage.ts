// 文件说明：前端管理端接口封装，用于发起删除学期请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type DeleteSemesterPayload = {
  sessionToken: SessionToken
}

export function createDeleteSemesterRequest(
  sessionToken: SessionToken,
  semesterId: string,
): ApiRequest<DeleteSemesterPayload, string> {
  return {
    name: 'DeleteSemesterAPIMessage',
    method: 'DELETE',
    path: `/api/v1/admin/semesters/${semesterId}`,
    payload: { sessionToken },
    parseResponse: parseMessageText,
  }
}
