// 文件说明：定义系统示例NoteTitle领域数据类型，用于业务流程和接口传输。
export type NoteTitle = string

export const asNoteTitle = (value: string) => value.trim() as NoteTitle
