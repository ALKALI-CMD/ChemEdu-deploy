// 文件说明：定义课程目录课时内容类型领域数据类型，用于业务流程和接口传输。
export const LessonContentType = {
  Video: 'video',
  Slides: 'slides',
  RichText: 'rich_text',
  Download: 'download',
} as const

export type LessonContentType = typeof LessonContentType[keyof typeof LessonContentType]
