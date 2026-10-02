// 文件说明：定义系统示例Note状态领域数据类型，用于业务流程和接口传输。
export const NoteStatus = {
  Draft: 'draft',
  Published: 'published',
} as const

export type NoteStatus = typeof NoteStatus[keyof typeof NoteStatus]
