// 文件说明：定义学习课时进度状态领域数据类型，用于业务流程和接口传输。
export const LessonProgressStatus = {
  Completed: 'completed',
  Incomplete: 'incomplete',
} as const

export type LessonProgressStatus = typeof LessonProgressStatus[keyof typeof LessonProgressStatus]
