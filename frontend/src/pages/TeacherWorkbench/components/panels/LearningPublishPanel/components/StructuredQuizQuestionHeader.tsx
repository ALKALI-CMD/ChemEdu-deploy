import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import { Button } from '@/components/ui/UiComponents'
import { getDefaultPoints, normalizeOptions, questionTypeOptions, type EditableQuestion } from '../functions/structuredQuizQuestionModel'

type StructuredQuizQuestionHeaderProps = {
  question: EditableQuestion
  index: number
  totalQuestions: number
  onChange: (question: EditableQuestion) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export default function StructuredQuizQuestionHeader({
  question,
  index,
  totalQuestions,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: StructuredQuizQuestionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="cursor-grab rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">拖拽排序</span>
        <p className="text-sm font-semibold text-slate-950">第 {index + 1} 题</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          value={question.type}
          onChange={(event) => {
            const nextType = event.target.value as QuizQuestionType
            onChange({
              ...question,
              type: nextType,
              points: getDefaultPoints(nextType),
              options: normalizeOptions(nextType, question),
              correctAnswers: [],
            })
          }}
        >
          {questionTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" className="rounded-full" onClick={onMoveUp} disabled={index === 0}>
          上移
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onMoveDown} disabled={index === totalQuestions - 1}>
          下移
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onDuplicate}>
          复制题目
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onDelete}>
          删除题目
        </Button>
      </div>
    </div>
  )
}
