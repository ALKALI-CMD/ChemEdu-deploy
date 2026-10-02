// 文件说明：定义考试评定域统计聚合领域数据类型，用于数据分析处看板。
export type ExamQuestionStat = {
  questionId: string
  title: string
  topicTag: string
  avgScore: number
  maxScore: number
  avgRate: number
  fullMarkRate: number
  zeroRate: number
}

export type ExamScoreBucket = {
  label: string
  count: number
}

export type ExamClassSummary = {
  studentCount: number
  gradedCount: number
  avgRaw: number | null
  avgConverted: number | null
}

export type ExamStatSummary = {
  examId: string
  examName: string
  cohortId: string
  cohortName: string
  status: string
  sheetCount: number
  gradedCount: number
  avgRaw: number | null
  maxRaw: number | null
  minRaw: number | null
  avgConverted: number | null
  questionStats: ExamQuestionStat[]
  buckets: ExamScoreBucket[]
}

export type CohortTrendRow = {
  cohortId: string
  cohortName: string
  examId: string
  examName: string
  gradedCount: number
  avgConverted: number | null
  scheduledStart: string
}
