// 文件说明：定义系统示例DemoNote领域数据类型，用于业务流程和接口传输。
import type { NoteBody } from '@/objects/system/NoteBody'
import type { NoteId } from '@/objects/system/NoteId'
import type { NoteStatus } from '@/objects/system/NoteStatus'
import type { NoteTitle } from '@/objects/system/NoteTitle'

export type DemoNote = {
  id: NoteId
  title: NoteTitle
  body: NoteBody
  status: NoteStatus
  createdAt: string
}
