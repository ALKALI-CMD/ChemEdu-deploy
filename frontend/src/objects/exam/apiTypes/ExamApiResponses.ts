// 文件说明：定义考试评定域期次与考试接口响应类型，用于前后端 API 返回值约束。
import type { TrainingCohort } from '../TrainingCohort'
import type { Exam } from '../Exam'
import type { AnswerSheet } from '../AnswerSheet'
import type { QuestionScoreEntry } from '../QuestionScoreEntry'
import type { ArgueTicket } from '../ArgueTicket'
import type { ExamAnalysis } from '../ExamAnalysis'
import type { ExamClassSummary } from '../ExamStatistics'

export type TrainingCohortMutationResponse = {
  message: string
  cohort: TrainingCohort
}

export type TrainingCohortListResponse = {
  message: string
  cohorts: TrainingCohort[]
}

export type ExamMutationResponse = {
  message: string
  exam: Exam
}

export type ExamListResponse = {
  message: string
  exams: Exam[]
  cohorts: TrainingCohort[]
}

export type StudentExamResultResponse = {
  message: string
  exam: Exam
  cohortName: string
  sheet: AnswerSheet | null
  scores: QuestionScoreEntry[]
  argues: ArgueTicket[]
  analysis: ExamAnalysis | null
  classSummary: ExamClassSummary
}
