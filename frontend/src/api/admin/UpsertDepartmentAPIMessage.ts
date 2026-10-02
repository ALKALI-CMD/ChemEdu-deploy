// 文件说明：前端管理端接口封装，用于发起新增或更新院系请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { Department } from '@/objects/admin/Department'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type UpsertDepartmentPayload = {
  sessionToken: SessionToken
  departmentId?: string
  name: string
}

export function createUpsertDepartmentRequest(
  sessionToken: SessionToken,
  department: { departmentId?: string; name: string },
): ApiRequest<UpsertDepartmentPayload, Department> {
  return {
    name: 'UpsertDepartmentAPIMessage',
    method: department.departmentId ? 'PUT' : 'POST',
    path: department.departmentId
      ? `/api/v1/admin/departments/${department.departmentId}`
      : '/api/v1/admin/departments',
    payload: {
      sessionToken,
      departmentId: department.departmentId,
      name: department.name,
    },
    parseResponse: parseEntityResponse<'department', Department>('department'),
  }
}
