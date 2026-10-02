// 文件说明：定义课程目录课时类型领域数据类型，用于业务流程和接口传输。
export const LessonType = {
  Video: 'video',
  Document: 'document',
  Quiz: 'quiz',
  Live: 'live',
} as const

export type LessonType = typeof LessonType[keyof typeof LessonType]
