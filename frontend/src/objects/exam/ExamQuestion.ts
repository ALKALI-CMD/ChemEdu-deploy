// 文件说明：定义考试评定域试卷题目领域数据类型，用于判分与折合分计算。
export type ExamQuestion = {
  id: string
  orderIndex: number
  title: string
  topicTag: string
  maxScore: number
  convertedScore: number
  referenceAnswer: string
}
