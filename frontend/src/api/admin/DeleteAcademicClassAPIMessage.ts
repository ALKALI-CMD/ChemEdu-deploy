// 文件说明：前端管理端接口封装，用于发起删除教学班级请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type DeleteAcademicClassPayload = {
  sessionToken: SessionToken
}

export function createDeleteAcademicClassRequest(
  sessionToken: SessionToken,
  academicClassId: string,
): ApiRequest<DeleteAcademicClassPayload, string> {
  return {
    name: 'DeleteAcademicClassAPIMessage',
    method: 'DELETE',
    path: `/api/v1/admin/academic-classes/${academicClassId}`,
    payload: { sessionToken },
    parseResponse: parseMessageText,
  }
}
