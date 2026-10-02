// 文件说明：定义学习测验Option领域数据类型，用于业务流程和接口传输。
export const QuizOption = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const

export type QuizOption = typeof QuizOption[keyof typeof QuizOption]
