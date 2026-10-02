// 文件说明：定义系统示例NoteId领域数据类型，用于业务流程和接口传输。
export type NoteId = string

export const asNoteId = (value: string) => value as NoteId
