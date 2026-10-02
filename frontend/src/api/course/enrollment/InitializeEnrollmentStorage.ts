// 文件说明：初始化课程报名相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import type { EnrollmentMessageResponse } from '@/objects/course/enrollment/apiTypes/EnrollmentMessageResponse'

export type InitializeEnrollmentStoragePayload = Record<string, never>

export function createInitializeEnrollmentStorageRequest(): ApiRequest<InitializeEnrollmentStoragePayload, EnrollmentMessageResponse> {
  return {
    name: 'InitializeEnrollmentStorage',
    method: 'POST',
    path: '/api/InitializeEnrollmentStorage',
    payload: {},
  }
}
