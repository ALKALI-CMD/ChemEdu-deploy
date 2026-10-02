// 文件说明：定义考试评定域智能分析、统计与报名线索接口响应类型，用于前后端 API 返回值约束。
import type { ExamAnalysis } from '../ExamAnalysis'
import type { ExamStatSummary, CohortTrendRow } from '../ExamStatistics'
import type { EnrollmentLead } from '../EnrollmentLead'

export type ExamAnalysisMutationResponse = {
  message: string
  analysis: ExamAnalysis
}

export type ExamStatisticsResponse = {
  message: string
  summaries: ExamStatSummary[]
  cohortTrends: CohortTrendRow[]
}

export type EnrollmentLeadMutationResponse = {
  message: string
  lead: EnrollmentLead
}

export type EnrollmentLeadListResponse = {
  message: string
  leads: EnrollmentLead[]
}
