// 文件说明：定义系统示例NoteBody领域数据类型，用于业务流程和接口传输。
export type NoteBody = string

export const asNoteBody = (value: string) => value.trim() as NoteBody
