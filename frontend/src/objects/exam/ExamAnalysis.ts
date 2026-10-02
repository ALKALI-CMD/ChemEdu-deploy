// 文件说明：定义考试评定域智能分析报告领域数据类型，用于学生短板分析与建议展示。
export type ExamWeaknessItem = {
  topic: string
  questionId: string
  scoreRate: number
  classAvgRate: number
  comment: string
}

export type ExamStrengthItem = {
  topic: string
  scoreRate: number
  comment: string
}

export type ExamAnalysisContent = {
  summary: string
  strengths: ExamStrengthItem[]
  weaknesses: ExamWeaknessItem[]
  suggestions: string[]
  focusTopics: string[]
}

export type ExamAnalysis = {
  id: string
  examId: string
  studentId: string
  studentName: string
  source: string
  model: string
  content: ExamAnalysisContent
  generatedAt: string
}
