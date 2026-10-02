import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import { Input, Label } from '@/components/ui/UiComponents'
import type { EditableQuestion } from '../functions/structuredQuizQuestionModel'

type StructuredQuizQuestionOptionsProps = {
  question: EditableQuestion
  questionIndex: number
  onChange: (question: EditableQuestion) => void
}

export default function StructuredQuizQuestionOptions({
  question,
  questionIndex,
  onChange,
}: StructuredQuizQuestionOptionsProps) {
  if (question.type === QuizQuestionType.FillBlank || question.type === QuizQuestionType.Subjective) return null

  return (
    <div className="grid gap-3">
      <Label>选项（客观题必填）</Label>
      <div className="grid gap-2">
        {question.options.map((option, optionIndex) => (
          <div key={`${questionIndex}-option-${optionIndex}`} className="flex items-center gap-2">
            <span className="w-12 text-sm text-slate-500">{String.fromCharCode(65 + optionIndex)}</span>
            <Input
              required
              aria-required="true"
              value={option}
              onChange={(event) =>
                onChange({
                  ...question,
                  options: question.options.map((item, itemIndex) =>
                    itemIndex === optionIndex ? event.target.value : item,
                  ),
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
