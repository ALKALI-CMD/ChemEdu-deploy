// 文件说明：初始化学习相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type InitializeLearningStoragePayload = Record<string, never>

export function createInitializeLearningStorageRequest(): ApiRequest<InitializeLearningStoragePayload, string> {
  return {
    name: 'InitializeLearningStorage',
    method: 'POST',
    path: '/api/InitializeLearningStorage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
