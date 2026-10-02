// 文件说明：前端课程目录接口封装，用于发起Seed课程课程目录DataIfNeeded请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type SeedCourseCatalogDataIfNeededPayload = Record<string, never>

export function createSeedCourseCatalogDataIfNeededRequest(): ApiRequest<SeedCourseCatalogDataIfNeededPayload, string> {
  return {
    name: 'SeedCourseCatalogDataIfNeededAPIMessage',
    method: 'POST',
    path: '/api/SeedCourseCatalogDataIfNeededAPIMessage',
    payload: {},
    parseResponse: parseMessageText,
  }
}
