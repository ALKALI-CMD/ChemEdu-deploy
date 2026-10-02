import StructuredQuizQuestionCard from './StructuredQuizQuestionCard'
import type { useStructuredQuizQuestionEditor } from '../hooks/useStructuredQuizQuestionEditor'

type StructuredQuizQuestionListProps = {
  editor: ReturnType<typeof useStructuredQuizQuestionEditor>
}

export default function StructuredQuizQuestionList({ editor }: StructuredQuizQuestionListProps) {
  if (editor.questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        暂无题目。
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {editor.questions.map((question, index) => (
        <StructuredQuizQuestionCard
          key={`${question.type}-${index}-${question.prompt}`}
          question={question}
          index={index}
          totalQuestions={editor.questions.length}
          isDragging={editor.draggingIndex === index}
          onDragStart={() => editor.setDraggingIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (editor.draggingIndex !== null) {
              editor.moveQuestion(editor.draggingIndex, index)
            }
            editor.setDraggingIndex(null)
          }}
          onDragEnd={() => editor.setDraggingIndex(null)}
          onChange={(nextQuestion) => editor.updateQuestion(index, nextQuestion)}
          onMoveUp={() => editor.moveQuestion(index, index - 1)}
          onMoveDown={() => editor.moveQuestion(index, index + 1)}
          onDuplicate={() => editor.duplicateQuestion(index)}
          onDelete={() => editor.deleteQuestion(index)}
        />
      ))}
    </div>
  )
}
