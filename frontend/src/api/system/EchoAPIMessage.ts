// 文件说明：前端系统示例接口封装，用于发起回显请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { EchoResponse } from '@/objects/system/apiTypes/EchoResponse'

export type EchoPayload = {
  message: string
  uppercase: boolean
}

export function createEchoRequest(payload: EchoPayload): ApiRequest<EchoPayload, EchoResponse> {
  return {
    name: 'EchoAPIMessage',
    method: 'POST',
    path: '/api/EchoAPIMessage',
    payload,
  }
}
