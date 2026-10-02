// 文件说明：前端课程报名接口封装，用于发起列表查询候补名单Entries请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { WaitlistEntry } from '@/objects/course/enrollment/WaitlistEntry'

export type ListWaitlistEntriesPayload = {
  sessionToken: SessionToken
}

export function createListWaitlistEntriesRequest(
  sessionToken: SessionToken,
): ApiRequest<ListWaitlistEntriesPayload, WaitlistEntry[]> {
  return {
    name: 'ListWaitlistEntriesAPIMessage',
    method: 'POST',
    path: '/api/ListWaitlistEntriesAPIMessage',
    payload: { sessionToken },
  }
}
