import { useState } from 'react'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import type { NoticeState } from '@/components/ExperienceState'
import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'
import { QuizOption } from '@/objects/course/learning/QuizOption'
import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { QuizAnswerRecord } from '@/objects/course/learning/QuizAnswerRecord'
import { filesToAssignmentAttachments } from '@/lib/assignment-attachments'

type StudentCenterActions = Pick<EducationDashboardContextValue, 'submitAssignment' | 'submitQuiz'>

export function useStudentCenterActions(actions: StudentCenterActions, studentQuizzes: Quiz[]) {
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({})
  const [assignmentAttachmentDrafts, setAssignmentAttachmentDrafts] = useState<Record<string, AssignmentAttachment[]>>({})
  const [quizSubjectiveDrafts, setQuizSubjectiveDrafts] = useState<Record<string, string>>({})
  const [quizObjectiveDrafts, setQuizObjectiveDrafts] = useState<Record<string, QuizOption[]>>({})
  const [quizAnswerDrafts, setQuizAnswerDrafts] = useState<Record<string, Record<string, string[]>>>({})
  const [submittingKey, setSubmittingKey] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState>(null)

  async function handleSelectAssignmentFiles(assignmentId: string, files: FileList | null) {
    const attachments = await filesToAssignmentAttachments(files, AssignmentAttachmentType.Submission)
    setAssignmentAttachmentDrafts((current) => ({ ...current, [assignmentId]: attachments }))
  }

  async function handleSubmitAssignment(
    assignmentId: string,
    draftValue: string,
    attachments: AssignmentAttachment[],
  ) {
    setNotice(null)

    if (!draftValue.trim() && attachments.length === 0) {
      setNotice({
        tone: 'error',
        title: '作业尚未提交',
        message: '请先填写答案或上传至少一个附件，再提交作业。',
      })
      return
    }

    setSubmittingKey(`assignment:${assignmentId}`)
    try {
      await actions.submitAssignment(assignmentId, draftValue.trim(), attachments)
      setAssignmentDrafts((current) => ({ ...current, [assignmentId]: '' }))
      setAssignmentAttachmentDrafts((current) => ({ ...current, [assignmentId]: [] }))
      setNotice({
        tone: 'success',
        title: '作业提交成功',
        message: '你的最新提交已经保存，并会同步显示到教师端。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '作业提交失败',
        message: error instanceof Error ? error.message : '提交作业时出现未知错误。',
      })
    } finally {
      setSubmittingKey(null)
    }
  }

  async function handleSubmitQuiz(quizId: string): Promise<boolean> {
    setNotice(null)

    const quiz = studentQuizzes.find((item) => item.id === quizId)
    if (!quiz) {
      return false
    }

    const answers = quizObjectiveDrafts[quizId] ?? []
    const answerDraftMap = quizAnswerDrafts[quizId] ?? {}
    const answerRecords: QuizAnswerRecord[] = quiz.questionBank.map((question, index) => {
      const draftedAnswers = answerDraftMap[question.id]
      const blankCount = Math.max(1, question.correctAnswers.length)
      const submittedAnswers =
        draftedAnswers ??
        (question.questionType === QuizQuestionType.Subjective
          ? [quizSubjectiveDrafts[quizId] ?? '']
          : question.questionType === QuizQuestionType.FillBlank
            ? Array.from({ length: blankCount }, () => '')
            : answers[index]
              ? [answers[index]]
              : [])

      return {
        questionId: question.id,
        submittedAnswers,
        correct: false,
      }
    })

    const fillBlankAnswers = answerRecords
      .filter((record) => quiz.questionBank.find((question) => question.id === record.questionId)?.questionType === QuizQuestionType.FillBlank)
      .flatMap((record) => record.submittedAnswers)

    setSubmittingKey(`quiz:${quizId}`)
    try {
      await actions.submitQuiz(
        quizId,
        answers,
        quizSubjectiveDrafts[quizId]?.trim() ? quizSubjectiveDrafts[quizId].trim() : undefined,
        fillBlankAnswers,
        answerRecords,
      )
      setNotice({
        tone: 'success',
        title: '测验提交成功',
        message: '你的答案已经保存，成绩会同步到成绩栏目。',
      })
      return true
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '测验提交失败',
        message: error instanceof Error ? error.message : '提交测验时出现未知错误。',
      })
      return false
    } finally {
      setSubmittingKey(null)
    }
  }

  function updateObjectiveAnswer(quizId: string, index: number, answer: QuizOption) {
    setQuizObjectiveDrafts((current) => {
      const nextAnswers = [...(current[quizId] ?? Array.from({ length: index + 1 }, () => QuizOption.A))]
      while (nextAnswers.length <= index) nextAnswers.push(QuizOption.A)
      nextAnswers[index] = answer
      return { ...current, [quizId]: nextAnswers }
    })
  }

  function updateQuizAnswer(quizId: string, questionId: string, answers: string[]) {
    setQuizAnswerDrafts((current) => ({
      ...current,
      [quizId]: {
        ...(current[quizId] ?? {}),
        [questionId]: answers,
      },
    }))
  }

  return {
    assignmentDrafts,
    setAssignmentDrafts,
    assignmentAttachmentDrafts,
    setAssignmentAttachmentDrafts,
    quizSubjectiveDrafts,
    setQuizSubjectiveDrafts,
    quizObjectiveDrafts,
    setQuizObjectiveDrafts,
    quizAnswerDrafts,
    setQuizAnswerDrafts,
    submittingKey,
    notice,
    setNotice,
    handleSelectAssignmentFiles,
    handleSubmitAssignment,
    handleSubmitQuiz,
    updateObjectiveAnswer,
    updateQuizAnswer,
  }
}
