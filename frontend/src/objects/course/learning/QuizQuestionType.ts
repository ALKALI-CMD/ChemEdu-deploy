// 文件说明：定义学习测验题目类型领域数据类型，用于业务流程和接口传输。
export const QuizQuestionType = {
  SingleChoice: 'single_choice',
  MultipleChoice: 'multiple_choice',
  TrueFalse: 'true_false',
  FillBlank: 'fill_blank',
  Subjective: 'subjective',
} as const

export type QuizQuestionType = typeof QuizQuestionType[keyof typeof QuizQuestionType]
