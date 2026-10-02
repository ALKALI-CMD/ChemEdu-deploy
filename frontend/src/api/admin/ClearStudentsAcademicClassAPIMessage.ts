// 文件说明：前端管理端接口封装，用于发起清空Students教学班级请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type ClearStudentsAcademicClassPayload = {
  sessionToken: SessionToken
  studentIds: string[]
}

export function createClearStudentsAcademicClassRequest(
  sessionToken: SessionToken,
  studentIds: string[],
): ApiRequest<ClearStudentsAcademicClassPayload, string> {
  return {
    name: 'ClearStudentsAcademicClassAPIMessage',
    method: 'POST',
    path: '/api/v1/admin/students/class-clear',
    payload: {
      sessionToken,
      studentIds,
    },
    parseResponse: parseMessageText,
  }
}
