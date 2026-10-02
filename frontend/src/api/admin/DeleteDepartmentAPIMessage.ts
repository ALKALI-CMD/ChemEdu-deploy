// 文件说明：前端管理端接口封装，用于发起删除院系请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type DeleteDepartmentPayload = {
  sessionToken: SessionToken
}

export function createDeleteDepartmentRequest(
  sessionToken: SessionToken,
  departmentId: string,
): ApiRequest<DeleteDepartmentPayload, string> {
  return {
    name: 'DeleteDepartmentAPIMessage',
    method: 'DELETE',
    path: `/api/v1/admin/departments/${departmentId}`,
    payload: { sessionToken },
    parseResponse: parseMessageText,
  }
}
