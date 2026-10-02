// 文件说明：前端管理端接口封装，用于发起新增或更新学期请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type UpsertSemesterPayload = {
  sessionToken: SessionToken
  semesterId?: string
  label: string
  startAt: string
  endAt: string
  archived: boolean
}

export function createUpsertSemesterRequest(
  sessionToken: SessionToken,
  semester: { semesterId?: string; label: string; startAt: string; endAt: string; archived: boolean },
): ApiRequest<UpsertSemesterPayload, SemesterTerm> {
  return {
    name: 'UpsertSemesterAPIMessage',
    method: semester.semesterId ? 'PUT' : 'POST',
    path: semester.semesterId ? `/api/v1/admin/semesters/${semester.semesterId}` : '/api/v1/admin/semesters',
    payload: {
      sessionToken,
      semesterId: semester.semesterId,
      label: semester.label,
      startAt: semester.startAt,
      endAt: semester.endAt,
      archived: semester.archived,
    },
    parseResponse: parseEntityResponse<'semester', SemesterTerm>('semester'),
  }
}
