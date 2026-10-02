// 文件说明：初始化课程评价相关存储或基础数据的接口定义。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type InitializeCourseReviewStoragePayload = Record<string, never>

export function createInitializeCourseReviewStorageRequest(): ApiRequest<InitializeCourseReviewStoragePayload, string> {
  return {
    name: 'InitializeCourseReviewStorage',
    method: 'POST',
    path: '/api/InitializeCourseReviewStorage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
