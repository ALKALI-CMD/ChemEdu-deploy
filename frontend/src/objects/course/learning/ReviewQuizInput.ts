// 文件说明：定义学习评价/批改测验领域数据类型，用于业务流程和接口传输。

export type ReviewQuizInput = {
  quizId: string
  subjectiveScore: number
  feedback?: string
}
