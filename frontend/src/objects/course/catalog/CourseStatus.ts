// 文件说明：定义课程目录课程状态领域数据类型，用于业务流程和接口传输。
export const CourseStatus = {
  Published: 'published',
  Draft: 'draft',
  Archived: 'archived',
} as const

export type CourseStatus = typeof CourseStatus[keyof typeof CourseStatus]
