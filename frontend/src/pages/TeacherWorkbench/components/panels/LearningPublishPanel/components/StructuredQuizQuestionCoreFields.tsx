import { Input, Label, Textarea } from '@/components/ui/UiComponents'
import { getDefaultPoints, type EditableQuestion } from '../functions/structuredQuizQuestionModel'

type StructuredQuizQuestionCoreFieldsProps = {
  question: EditableQuestion
  onChange: (question: EditableQuestion) => void
}

export default function StructuredQuizQuestionCoreFields({ question, onChange }: StructuredQuizQuestionCoreFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label>题干（必填）</Label>
        <Textarea
          required
          aria-required="true"
          className="min-h-20 bg-white"
          placeholder="输入题干（必填）"
          value={question.prompt}
          onChange={(event) => onChange({ ...question, prompt: event.target.value })}
        />
      </div>

      <div className="grid gap-2 sm:max-w-40">
        <Label>题目分值（必填）</Label>
        <Input
          required
          aria-required="true"
          type="number"
          min={1}
          value={question.points}
          onChange={(event) =>
            onChange({
              ...question,
              points: Math.max(1, Number(event.target.value) || getDefaultPoints(question.type)),
            })
          }
        />
      </div>
    </>
  )
}
