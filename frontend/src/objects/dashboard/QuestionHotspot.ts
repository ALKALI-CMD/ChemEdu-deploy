// 文件说明：定义看板题目热点领域数据类型，用于业务流程和接口传输。

export type QuestionHotspot = {
  courseId: string
  courseTitle: string
  quizTitle: string
  questionId: string
  questionPrompt: string
  questionType: string
  wrongCount: number
  attemptCount: number
  wrongRate: number
}
