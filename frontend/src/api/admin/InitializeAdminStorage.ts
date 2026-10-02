// 文件说明：初始化管理端相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type InitializeAdminStoragePayload = Record<string, never>

export function createInitializeAdminStorageRequest(): ApiRequest<InitializeAdminStoragePayload, string> {
  return {
    name: 'InitializeAdminStorage',
    method: 'POST',
    path: '/api/InitializeAdminStorage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
