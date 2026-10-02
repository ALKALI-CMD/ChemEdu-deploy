// 文件说明：初始化认证相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type InitializeAuthStoragePayload = Record<string, never>

export function createInitializeAuthStorageRequest(): ApiRequest<InitializeAuthStoragePayload, string> {
  return {
    name: 'InitializeAuthStorage',
    method: 'POST',
    path: '/api/InitializeAuthStorage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
