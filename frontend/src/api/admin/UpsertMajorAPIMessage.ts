// 文件说明：前端管理端接口封装，用于发起新增或更新专业请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { Major } from '@/objects/admin/Major'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type UpsertMajorPayload = {
  sessionToken: SessionToken
  majorId?: string
  departmentId: string
  name: string
}

export function createUpsertMajorRequest(
  sessionToken: SessionToken,
  major: { majorId?: string; departmentId: string; name: string },
): ApiRequest<UpsertMajorPayload, Major> {
  return {
    name: 'UpsertMajorAPIMessage',
    method: major.majorId ? 'PUT' : 'POST',
    path: major.majorId ? `/api/v1/admin/majors/${major.majorId}` : '/api/v1/admin/majors',
    payload: {
      sessionToken,
      majorId: major.majorId,
      departmentId: major.departmentId,
      name: major.name,
    },
    parseResponse: parseEntityResponse<'major', Major>('major'),
  }
}
