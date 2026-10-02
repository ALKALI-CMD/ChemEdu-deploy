// 文件说明：前端课程讨论接口封装，用于发起创建平台举报请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'

export type CreatePlatformReportPayload = {
  sessionToken: SessionToken
  targetType: string
  targetId: string
  targetLabel: string
  reason: string
  detail?: string
}

export function createPlatformReportRequest(
  sessionToken: SessionToken,
  targetType: string,
  targetId: string,
  targetLabel: string,
  reason: string,
  detail?: string,
): ApiRequest<CreatePlatformReportPayload, PlatformReport> {
  return {
    name: 'CreatePlatformReportAPIMessage',
    method: 'POST',
    path: '/api/v1/reports',
    payload: {
      sessionToken,
      targetType,
      targetId,
      targetLabel,
      reason,
      detail,
    },
    parseResponse: parseEntityResponse<'report', PlatformReport>('report'),
  }
}
