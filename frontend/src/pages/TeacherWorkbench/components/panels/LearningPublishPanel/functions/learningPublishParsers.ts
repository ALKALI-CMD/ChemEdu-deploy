import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'
import { QuizOption } from '@/objects/course/learning/QuizOption'
import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import type { AssignmentRubricCriterion } from '@/objects/course/learning/AssignmentRubricCriterion'
import type { QuizQuestion } from '@/objects/course/learning/QuizQuestion'
import {
  parseQuestionBankText,
  type EditableQuestion,
} from './structuredQuizQuestionModel'

export function deriveObjectiveAnswerKeys(questionBank: QuizQuestion[]): QuizOption[] {
  return questionBank
    .filter((question) => question.questionType !== QuizQuestionType.Subjective)
    .map((question) => {
      const firstAnswer = question.correctAnswers[0]?.trim().toUpperCase()
      return Object.values(QuizOption).includes(firstAnswer as QuizOption) ? (firstAnswer as QuizOption) : QuizOption.A
    })
}

export function parseRubric(text: string): AssignmentRubricCriterion[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, description = '', maxScoreText = '10'] = line.split('|').map((item) => item.trim())
      return {
        id: `rubric-${index + 1}`,
        title,
        description,
        maxScore: Math.max(1, Number(maxScoreText) || 10),
      }
    })
}

export function parseReferenceAttachments(text: string) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({
      label: label.trim(),
      url: '',
      attachmentType: AssignmentAttachmentType.Reference,
    }))
}

function toQuizQuestion(question: EditableQuestion, index: number): QuizQuestion {
  return {
    id: `question-${index + 1}`,
    questionType: question.type,
    prompt: question.prompt.trim(),
    options:
      question.type === QuizQuestionType.FillBlank || question.type === QuizQuestionType.Subjective
        ? []
        : question.options
            .map((label, optionIndex) => ({
              key: String.fromCharCode(65 + optionIndex),
              label: label.trim(),
            }))
            .filter((option) => option.label),
    correctAnswers: question.correctAnswers.map((item) => item.trim()).filter(Boolean),
    explanation: question.explanation.trim() || undefined,
    points: Math.max(1, question.points),
  }
}

export function parseStructuredQuestionBank(text: string): QuizQuestion[] {
  return parseQuestionBankText(text)
    .filter((question) => question.prompt.trim().length > 0)
    .map(toQuizQuestion)
}
