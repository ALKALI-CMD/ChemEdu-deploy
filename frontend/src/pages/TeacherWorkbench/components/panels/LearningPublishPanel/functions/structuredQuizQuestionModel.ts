import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'

export type EditableQuestion = {
  type: QuizQuestionType
  prompt: string
  points: number
  options: string[]
  correctAnswers: string[]
  explanation: string
}

export const questionTypeOptions: { value: QuizQuestionType; label: string }[] = [
  { value: QuizQuestionType.SingleChoice, label: '单选题' },
  { value: QuizQuestionType.MultipleChoice, label: '多选题' },
  { value: QuizQuestionType.TrueFalse, label: '判断题' },
  { value: QuizQuestionType.FillBlank, label: '填空题' },
  { value: QuizQuestionType.Subjective, label: '主观题' },
]

export function getDefaultPoints(type: QuizQuestionType) {
  switch (type) {
    case QuizQuestionType.Subjective:
      return 20
    case QuizQuestionType.FillBlank:
      return 12
    case QuizQuestionType.MultipleChoice:
      return 15
    default:
      return 10
  }
}

export function normalizeOptions(type: QuizQuestionType, current: EditableQuestion) {
  if (type === QuizQuestionType.FillBlank || type === QuizQuestionType.Subjective) {
    return []
  }
  if (type === QuizQuestionType.TrueFalse) {
    return ['正确', '错误']
  }
  return current.options.length > 0 ? current.options : ['选项 A', '选项 B', '选项 C', '选项 D']
}

export function buildDefaultQuestion(type: QuizQuestionType = QuizQuestionType.SingleChoice): EditableQuestion {
  return {
    type,
    prompt: '',
    points: getDefaultPoints(type),
    options:
      type === QuizQuestionType.FillBlank || type === QuizQuestionType.Subjective
        ? []
        : type === QuizQuestionType.TrueFalse
          ? ['正确', '错误']
          : ['选项 A', '选项 B', '选项 C', '选项 D'],
    correctAnswers: [],
    explanation: '',
  }
}

export function parseQuestionBankText(value: string): EditableQuestion[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('::').map((item) => item.trim())
      const [typeText = '', prompt = ''] = parts
      const legacyMode = parts.length <= 5
      const pointsText = legacyMode ? '' : parts[2] ?? ''
      const optionText = legacyMode ? parts[2] ?? '' : parts[3] ?? ''
      const answerText = legacyMode ? parts[3] ?? '' : parts[4] ?? ''
      const explanation = legacyMode ? parts[4] ?? '' : parts[5] ?? ''
      const type =
        typeText === QuizQuestionType.MultipleChoice
          ? QuizQuestionType.MultipleChoice
          : typeText === QuizQuestionType.TrueFalse
            ? QuizQuestionType.TrueFalse
            : typeText === QuizQuestionType.FillBlank
              ? QuizQuestionType.FillBlank
              : typeText === QuizQuestionType.Subjective
                ? QuizQuestionType.Subjective
                : QuizQuestionType.SingleChoice

      return {
        type,
        prompt,
        points: Math.max(1, Number(pointsText) || getDefaultPoints(type)),
        options:
          type === QuizQuestionType.FillBlank || type === QuizQuestionType.Subjective
            ? []
            : optionText
                .split('|')
                .map((item) => item.trim())
                .filter(Boolean),
        correctAnswers: answerText
          .split('|')
          .map((item) => item.trim())
          .filter(Boolean),
        explanation,
      }
    })
}

export function serializeQuestionBankText(questions: EditableQuestion[]) {
  return questions
    .map((question) => {
      const optionText =
        question.type === QuizQuestionType.FillBlank || question.type === QuizQuestionType.Subjective
          ? ''
          : question.options.map((item) => item.trim()).filter(Boolean).join('|')

      return [
        question.type,
        question.prompt.trim(),
        String(Math.max(1, question.points || getDefaultPoints(question.type))),
        optionText,
        question.correctAnswers.map((item) => item.trim()).filter(Boolean).join('|'),
        question.explanation.trim(),
      ].join('::')
    })
    .join('\n')
}

export function getQuestionSummary(questions: EditableQuestion[]) {
  return {
    objective: questions.filter((item) => item.type !== QuizQuestionType.Subjective).length,
    subjective: questions.filter((item) => item.type === QuizQuestionType.Subjective).length,
    totalPoints: questions.reduce((sum, item) => sum + Math.max(1, item.points), 0),
  }
}

export function updateQuestions(
  questions: EditableQuestion[],
  onChange: (value: string) => void,
  updater: (draft: EditableQuestion[]) => EditableQuestion[],
) {
  onChange(serializeQuestionBankText(updater(questions)))
}
