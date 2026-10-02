import { useRef, useState } from 'react'
import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import {
  buildDefaultQuestion,
  getDefaultPoints,
  getQuestionSummary,
  parseQuestionBankText,
  serializeQuestionBankText,
  type EditableQuestion,
  updateQuestions,
} from '../functions/structuredQuizQuestionModel'

export function useStructuredQuizQuestionEditor(value: string, onChange: (value: string) => void) {
  const questions = parseQuestionBankText(value)
  const summary = getQuestionSummary(questions)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  function updateQuestion(index: number, nextQuestion: EditableQuestion) {
    updateQuestions(questions, onChange, (draft) =>
      draft.map((item, itemIndex) => (itemIndex === index ? nextQuestion : item)),
    )
  }

  function moveQuestion(from: number, to: number) {
    if (to < 0 || to >= questions.length || from === to) return
    updateQuestions(questions, onChange, (draft) => {
      const next = [...draft]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function duplicateQuestion(index: number) {
    updateQuestions(questions, onChange, (draft) => {
      const next = [...draft]
      const source = draft[index]
      next.splice(index + 1, 0, {
        ...source,
        options: [...source.options],
        correctAnswers: [...source.correctAnswers],
      })
      return next
    })
  }

  function deleteQuestion(index: number) {
    updateQuestions(questions, onChange, (draft) => draft.filter((_, itemIndex) => itemIndex !== index))
  }

  function addQuestion(questionType: QuizQuestionType) {
    updateQuestions(questions, onChange, (draft) => [...draft, buildDefaultQuestion(questionType)])
  }

  function exportQuestions() {
    const payload = JSON.stringify(questions, null, 2)
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quiz-question-bank.json'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  async function importQuestionFile(file: File) {
    const raw = await file.text()
    try {
      const imported = JSON.parse(raw) as EditableQuestion[]
      if (Array.isArray(imported)) {
        const normalized = imported.map((question) => ({
          ...buildDefaultQuestion(question.type ?? QuizQuestionType.SingleChoice),
          ...question,
          points: Math.max(1, Number(question.points) || getDefaultPoints(question.type ?? QuizQuestionType.SingleChoice)),
          options: Array.isArray(question.options) ? question.options : [],
          correctAnswers: Array.isArray(question.correctAnswers) ? question.correctAnswers : [],
        }))
        onChange(serializeQuestionBankText(normalized))
        return
      }
    } catch {
      // Fallback to plain text import.
    }

    onChange(raw)
  }

  return {
    questions,
    summary,
    draggingIndex,
    setDraggingIndex,
    importInputRef,
    updateQuestion,
    moveQuestion,
    duplicateQuestion,
    deleteQuestion,
    addQuestion,
    exportQuestions,
    importQuestionFile,
  }
}
