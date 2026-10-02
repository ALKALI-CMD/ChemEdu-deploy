// 文件说明：前端管理端接口封装，用于发起归档学期请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type ArchiveSemesterPayload = {
  sessionToken: SessionToken
  semesterId: string
  archiveCourses: boolean
}

export function createArchiveSemesterRequest(
  sessionToken: SessionToken,
  semesterId: string,
  archiveCourses: boolean,
): ApiRequest<ArchiveSemesterPayload, string> {
  return {
    name: 'ArchiveSemesterAPIMessage',
    method: 'POST',
    path: `/api/v1/admin/semesters/${semesterId}/archive`,
    payload: {
      sessionToken,
      semesterId,
      archiveCourses,
    },
    parseResponse: parseMessageText,
  }
}
