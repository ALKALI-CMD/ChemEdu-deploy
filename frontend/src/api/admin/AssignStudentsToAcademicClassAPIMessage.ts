// 文件说明：前端管理端接口封装，用于发起分配StudentsTo教学班级请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type AssignStudentsToAcademicClassPayload = {
  sessionToken: SessionToken
  academicClassId: string
  studentIds: string[]
}

export function createAssignStudentsToAcademicClassRequest(
  sessionToken: SessionToken,
  academicClassId: string,
  studentIds: string[],
): ApiRequest<AssignStudentsToAcademicClassPayload, string> {
  return {
    name: 'AssignStudentsToAcademicClassAPIMessage',
    method: 'POST',
    path: `/api/v1/admin/academic-classes/${academicClassId}/students`,
    payload: {
      sessionToken,
      academicClassId,
      studentIds,
    },
    parseResponse: parseMessageText,
  }
}
