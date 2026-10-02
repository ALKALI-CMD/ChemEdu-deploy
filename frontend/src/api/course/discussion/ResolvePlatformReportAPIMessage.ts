// 文件说明：前端课程讨论接口封装，用于发起解析平台举报请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'

export type ResolvePlatformReportPayload = {
  sessionToken: SessionToken
  reportId: string
  status: string
  resolutionNote?: string
}

export function createResolvePlatformReportRequest(
  sessionToken: SessionToken,
  reportId: string,
  status: string,
  resolutionNote?: string,
): ApiRequest<ResolvePlatformReportPayload, PlatformReport> {
  return {
    name: 'ResolvePlatformReportAPIMessage',
    method: 'PATCH',
    path: `/api/v1/reports/${reportId}`,
    payload: {
      sessionToken,
      reportId,
      status,
      resolutionNote,
    },
    parseResponse: parseEntityResponse<'report', PlatformReport>('report'),
  }
}
