// 文件说明：初始化课程目录相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type InitializeCourseCatalogStoragePayload = Record<string, never>

export function createInitializeCourseCatalogStorageRequest(): ApiRequest<InitializeCourseCatalogStoragePayload, string> {
  return {
    name: 'InitializeCourseCatalogStorage',
    method: 'POST',
    path: '/api/InitializeCourseCatalogStorage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
