// 文件说明：教研考试管理数据钩子，管理期次、考试、改题区域、成绩册与争分复核动作。
import { useCallback, useEffect, useState } from 'react'
import { createGetExamScoreboardRequest } from '@/api/exam/GetExamScoreboardAPIMessage'
import { createListAnswerSheetsRequest } from '@/api/exam/ListAnswerSheetsAPIMessage'
import { createListArgueTicketsRequest } from '@/api/exam/ListArgueTicketsAPIMessage'
import { createListExamsRequest } from '@/api/exam/ListExamsAPIMessage'
import { createListTrainingCohortsRequest } from '@/api/exam/ListTrainingCohortsAPIMessage'
import { createResolveArgueTicketRequest } from '@/api/exam/ResolveArgueTicketAPIMessage'
import { createSaveGradingRegionsRequest } from '@/api/exam/SaveGradingRegionsAPIMessage'
import { createSetExamStatusRequest } from '@/api/exam/SetExamStatusAPIMessage'
import { createUpsertExamRequest } from '@/api/exam/UpsertExamAPIMessage'
import { createUpsertTrainingCohortRequest } from '@/api/exam/UpsertTrainingCohortAPIMessage'
import { sendAPI } from '@/lib/apiClient'
import type { Exam } from '@/objects/exam/Exam'
import type { AnswerSheet } from '@/objects/exam/AnswerSheet'
import type { ArgueTicket } from '@/objects/exam/ArgueTicket'
import type { GradingRegion } from '@/objects/exam/GradingRegion'
import type { ScoreboardRow } from '@/objects/exam/ScoreboardRow'
import type { TrainingCohort } from '@/objects/exam/TrainingCohort'

export type CohortFormInput = {
  id: string | null
  name: string
  season: string
  startDate: string
  endDate: string
  description: string
  memberIds: string[]
}

export function useExamManagementData(sessionToken: string) {
  const [cohorts, setCohorts] = useState<TrainingCohort[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [argues, setArgues] = useState<ArgueTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!sessionToken) return
    setLoading(true)
    try {
      const [cohortResponse, examResponse, argueResponse] = await Promise.all([
        sendAPI(createListTrainingCohortsRequest(sessionToken)),
        sendAPI(createListExamsRequest(sessionToken)),
        sendAPI(createListArgueTicketsRequest(sessionToken)),
      ])
      setCohorts(cohortResponse.cohorts)
      setExams(examResponse.exams)
      setArgues(argueResponse.tickets)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '考试数据加载失败。')
    } finally {
      setLoading(false)
    }
  }, [sessionToken])

  useEffect(() => {
    void load()
  }, [load])

  const saveCohort = useCallback(
    async (input: CohortFormInput) => {
      if (!sessionToken) return
      const response = await sendAPI(
        createUpsertTrainingCohortRequest({
          sessionToken,
          id: input.id,
          name: input.name,
          season: input.season,
          startDate: input.startDate,
          endDate: input.endDate,
          description: input.description,
          memberIds: input.memberIds,
          status: null,
        }),
      )
      setNotice(response.message)
      await load()
    },
    [sessionToken, load],
  )

  const saveExam = useCallback(
    async (payload: Omit<Parameters<typeof createUpsertExamRequest>[0], 'sessionToken'>) => {
      if (!sessionToken) return
      const response = await sendAPI(createUpsertExamRequest({ ...payload, sessionToken }))
      setNotice(response.message)
      await load()
    },
    [sessionToken, load],
  )

  const setExamStatus = useCallback(
    async (examId: string, status: string) => {
      if (!sessionToken) return
      const response = await sendAPI(createSetExamStatusRequest(sessionToken, examId, status))
      setNotice(response.message)
      await load()
    },
    [sessionToken, load],
  )

  const saveRegions = useCallback(
    async (examId: string, regions: Record<string, GradingRegion>, sheetTemplateImage: string | null) => {
      if (!sessionToken) return
      const response = await sendAPI(
        createSaveGradingRegionsRequest({ sessionToken, examId, regions, sheetTemplateImage }),
      )
      setNotice(response.message)
      await load()
    },
    [sessionToken, load],
  )

  const fetchSheets = useCallback(
    async (examId: string): Promise<AnswerSheet[]> => {
      if (!sessionToken) return []
      const response = await sendAPI(createListAnswerSheetsRequest(sessionToken, examId))
      return response.sheets
    },
    [sessionToken],
  )

  const fetchScoreboard = useCallback(
    async (examId: string): Promise<{ rows: ScoreboardRow[]; exam: Exam }> => {
      if (!sessionToken) return { rows: [], exam: null as unknown as Exam }
      const response = await sendAPI(createGetExamScoreboardRequest(sessionToken, examId))
      return { rows: response.rows, exam: response.exam }
    },
    [sessionToken],
  )

  const resolveArgue = useCallback(
    async (input: {
      ticketId: string
      action: 'adjust' | 'uphold' | 'reject'
      response: string
      adjustedScore: number | null
      adjustedComment: string | null
    }) => {
      if (!sessionToken) return
      const result = await sendAPI(createResolveArgueTicketRequest({ ...input, sessionToken }))
      setNotice(result.message)
      await load()
    },
    [sessionToken, load],
  )

  return {
    cohorts,
    exams,
    argues,
    loading,
    notice,
    setNotice,
    reload: load,
    saveCohort,
    saveExam,
    setExamStatus,
    saveRegions,
    fetchSheets,
    fetchScoreboard,
    resolveArgue,
  }
}
