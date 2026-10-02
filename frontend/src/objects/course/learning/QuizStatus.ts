// 文件说明：定义学习测验状态领域数据类型，用于业务流程和接口传输。
export const QuizStatus = {
  Upcoming: 'upcoming',
  Ongoing: 'ongoing',
  Finished: 'finished',
} as const

export type QuizStatus = typeof QuizStatus[keyof typeof QuizStatus]
