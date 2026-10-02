import { Button } from '@/components/ui/UiComponents'
import { questionTypeOptions } from '../functions/structuredQuizQuestionModel'
import { useStructuredQuizQuestionEditor } from '../hooks/useStructuredQuizQuestionEditor'
import StructuredQuizQuestionEditorHeader from './StructuredQuizQuestionEditorHeader'
import StructuredQuizQuestionList from './StructuredQuizQuestionList'

type StructuredQuizQuestionEditorProps = {
  value: string
  onChange: (value: string) => void
}

export default function StructuredQuizQuestionEditor({ value, onChange }: StructuredQuizQuestionEditorProps) {
  const editor = useStructuredQuizQuestionEditor(value, onChange)

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <input
        ref={editor.importInputRef}
        type="file"
        accept=".json,.txt"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            void editor.importQuestionFile(file)
          }
          event.target.value = ''
        }}
      />

      <StructuredQuizQuestionEditorHeader
        summary={editor.summary}
        hasQuestions={editor.questions.length > 0}
        onImport={() => editor.importInputRef.current?.click()}
        onExport={editor.exportQuestions}
      />
      <StructuredQuizQuestionList editor={editor} />

      <div className="flex flex-wrap gap-2">
        {questionTypeOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => editor.addQuestion(option.value)}
          >
            添加{option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
