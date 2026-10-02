import type { EditableQuestion } from '../functions/structuredQuizQuestionModel'
import StructuredQuizQuestionAnswerFields from './StructuredQuizQuestionAnswerFields'
import StructuredQuizQuestionCoreFields from './StructuredQuizQuestionCoreFields'
import StructuredQuizQuestionHeader from './StructuredQuizQuestionHeader'
import StructuredQuizQuestionOptions from './StructuredQuizQuestionOptions'

type StructuredQuizQuestionCardProps = {
  question: EditableQuestion
  index: number
  totalQuestions: number
  isDragging: boolean
  onDragStart: () => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: () => void
  onDragEnd: () => void
  onChange: (question: EditableQuestion) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export default function StructuredQuizQuestionCard({
  question,
  index,
  totalQuestions,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: StructuredQuizQuestionCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${
        isDragging ? 'opacity-60 ring-2 ring-sky-200' : ''
      }`}
    >
      <StructuredQuizQuestionHeader
        question={question}
        index={index}
        totalQuestions={totalQuestions}
        onChange={onChange}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />

      <div className="mt-4 grid gap-4">
        <StructuredQuizQuestionCoreFields question={question} onChange={onChange} />
        <StructuredQuizQuestionOptions question={question} questionIndex={index} onChange={onChange} />
        <StructuredQuizQuestionAnswerFields question={question} onChange={onChange} />
      </div>
    </div>
  )
}
