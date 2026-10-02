// 文件说明：定义考试评定域阅卷与争分接口响应类型，用于前后端 API 返回值约束。
import type { AnswerSheet } from '../AnswerSheet'
import type { QuestionScoreEntry } from '../QuestionScoreEntry'
import type { ArgueTicket } from '../ArgueTicket'
import type { Exam } from '../Exam'
import type { ScoreboardRow } from '../ScoreboardRow'

export type AnswerSheetMutationResponse = {
  message: string
  sheet: AnswerSheet
}

export type AnswerSheetListResponse = {
  message: string
  sheets: AnswerSheet[]
  scores: QuestionScoreEntry[]
}

export type QuestionScoreMutationResponse = {
  message: string
  sheet: AnswerSheet
  scores: QuestionScoreEntry[]
}

export type ScoreboardResponse = {
  message: string
  exam: Exam
  rows: ScoreboardRow[]
}

export type ArgueMutationResponse = {
  message: string
  ticket: ArgueTicket
}

export type ArgueListResponse = {
  message: string
  tickets: ArgueTicket[]
}
