// 文件说明：前端管理端接口封装，用于发起新增或更新教学班级请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type UpsertAcademicClassPayload = {
  sessionToken: SessionToken
  academicClassId?: string
  majorId: string
  grade: string
  name: string
  capacity: number
}

export function createUpsertAcademicClassRequest(
  sessionToken: SessionToken,
  academicClass: { academicClassId?: string; majorId: string; grade: string; name: string; capacity: number },
): ApiRequest<UpsertAcademicClassPayload, AcademicClass> {
  return {
    name: 'UpsertAcademicClassAPIMessage',
    method: academicClass.academicClassId ? 'PUT' : 'POST',
    path: academicClass.academicClassId
      ? `/api/v1/admin/academic-classes/${academicClass.academicClassId}`
      : '/api/v1/admin/academic-classes',
    payload: {
      sessionToken,
      academicClassId: academicClass.academicClassId,
      majorId: academicClass.majorId,
      grade: academicClass.grade,
      name: academicClass.name,
      capacity: academicClass.capacity,
    },
    parseResponse: parseEntityResponse<'academicClass', AcademicClass>('academicClass'),
  }
}
