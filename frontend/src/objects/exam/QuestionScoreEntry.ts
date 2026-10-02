// 文件说明：定义考试评定域单题判分记录领域数据类型，用于阅卷打分与折合分计算。
export type QuestionScoreEntry = {
  id: string
  examId: string
  sheetId: string
  questionId: string
  score: number
  maxScore: number
  convertedScore: number
  comment: string
  graderId: string
  graderName: string
  gradedAt: string
  adjusted: boolean
}
