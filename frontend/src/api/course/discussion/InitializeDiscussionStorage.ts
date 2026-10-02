// 文件说明：初始化课程讨论相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type InitializeDiscussionStoragePayload = Record<string, never>

export function createInitializeDiscussionStorageRequest(): ApiRequest<InitializeDiscussionStoragePayload, string> {
  return {
    name: 'InitializeDiscussionStorage',
    method: 'POST',
    path: '/api/InitializeDiscussionStorage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
