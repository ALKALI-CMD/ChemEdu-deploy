// 文件说明：前端系统示例接口封装，用于发起新增或更新DemoNote请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { DemoNote } from '@/objects/system/DemoNote'
import type { NoteStatus } from '@/objects/system/NoteStatus'

export type UpsertDemoNotePayload = {
  title: string
  body: string
  status: NoteStatus
}

export function createUpsertDemoNoteRequest(payload: UpsertDemoNotePayload): ApiRequest<UpsertDemoNotePayload, DemoNote> {
  return {
    name: 'UpsertDemoNoteAPIMessage',
    method: 'POST',
    path: '/api/UpsertDemoNoteAPIMessage',
    payload,
  }
}
