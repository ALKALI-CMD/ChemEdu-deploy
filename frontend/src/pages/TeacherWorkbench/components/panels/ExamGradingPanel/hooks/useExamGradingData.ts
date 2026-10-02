// 文件说明：助教阅卷数据钩子，管理考试选择、答题卡队列、判分记录与上传判分动作。
import { useCallback, useEffect, useState } from 'react'
import { createListAnswerSheetsRequest } from '@/api/exam/ListAnswerSheetsAPIMessage'
import { createListArgueTicketsRequest } from '@/api/exam/ListArgueTicketsAPIMessage'
import { createListExamsRequest } from '@/api/exam/ListExamsAPIMessage'
import { createSaveQuestionScoreRequest } from '@/api/exam/SaveQuestionScoreAPIMessage'
import { createUploadAnswerSheetRequest } from '@/api/exam/UploadAnswerSheetAPIMessage'
import { readImageAsCompressedDataUrl } from '@/lib/sheetImage'
import { sendAPI } from '@/lib/apiClient'
import type { Exam } from '@/objects/exam/Exam'
import type { AnswerSheet } from '@/objects/exam/AnswerSheet'
import type { ArgueTicket } from '@/objects/exam/ArgueTicket'
import type { QuestionScoreEntry } from '@/objects/exam/QuestionScoreEntry'
import type { TrainingCohort } from '@/objects/exam/TrainingCohort'

export function useExamGradingData(sessionToken: string) {
  const [exams, setExams] = useState<Exam[]>([])
  const [cohorts, setCohorts] = useState<TrainingCohort[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [sheets, setSheets] = useState<AnswerSheet[]>([])
  const [scores, setScores] = useState<QuestionScoreEntry[]>([])
  const [argues, setArgues] = useState<ArgueTicket[]>([])
  const [loadingExams, setLoadingExams] = useState(true)
  const [loadingSheets, setLoadingSheets] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const loadExams = useCallback(async () => {
    if (!sessionToken) return
    setLoadingExams(true)
    try {
      const response = await sendAPI(createListExamsRequest(sessionToken))
      setExams(response.exams)
      setCohorts(response.cohorts)
      setSelectedExamId((current) => current ?? response.exams[0]?.id ?? null)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '考试列表加载失败。')
    } finally {
      setLoadingExams(false)
    }
  }, [sessionToken])

  const loadSheets = useCallback(
    async (examId: string) => {
      if (!sessionToken) return
      setLoadingSheets(true)
      try {
        const response = await sendAPI(createListAnswerSheetsRequest(sessionToken, examId))
        setSheets(response.sheets)
        setScores(response.scores)
        try {
          const argueResponse = await sendAPI(createListArgueTicketsRequest(sessionToken, examId))
          setArgues(argueResponse.tickets)
        } catch {
          setArgues([])
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '答题卡列表加载失败。')
      } finally {
        setLoadingSheets(false)
      }
    },
    [sessionToken],
  )

  useEffect(() => {
    void loadExams()
  }, [loadExams])

  useEffect(() => {
    if (selectedExamId) {
      void loadSheets(selectedExamId)
    } else {
      setSheets([])
      setScores([])
    }
  }, [selectedExamId, loadSheets])

  const uploadSheet = useCallback(
    async (studentId: string, file: File) => {
      if (!sessionToken || !selectedExamId) throw new Error('请先选择考试。')
      const imageDataUrl = await readImageAsCompressedDataUrl(file)
      const response = await sendAPI(
        createUploadAnswerSheetRequest({ sessionToken, examId: selectedExamId, studentId, imageDataUrl }),
      )
      await loadSheets(selectedExamId)
      setNotice(`已上传 ${response.sheet.studentName} 的答题卡；重新上传会清空该生已有判分。`)
    },
    [sessionToken, selectedExamId, loadSheets],
  )

  const saveScore = useCallback(
    async (sheetId: string, questionId: string, score: number, comment: string) => {
      if (!sessionToken) return
      const response = await sendAPI(createSaveQuestionScoreRequest({ sessionToken, sheetId, questionId, score, comment }))
      setSheets((current) => current.map((sheet) => (sheet.id === response.sheet.id ? response.sheet : sheet)))
      setScores((current) => {
        const rest = current.filter((entry) => !(entry.sheetId === sheetId && entry.questionId === questionId))
        return [...rest, ...response.scores.filter((entry) => entry.sheetId === sheetId && entry.questionId === questionId)]
      })
    },
    [sessionToken],
  )

  return {
    exams,
    cohorts,
    selectedExamId,
    setSelectedExamId,
    sheets,
    scores,
    argues,
    loadingExams,
    loadingSheets,
    notice,
    setNotice,
    reloadSheets: loadSheets,
    uploadSheet,
    saveScore,
  }
}
