// 文件说明：定义学习测验AnswerRecord领域数据类型，用于业务流程和接口传输。
export type QuizAnswerRecord = {
  questionId: string
  submittedAnswers: string[]
  correct: boolean
}
