import { Button, Input, Label, Textarea } from '@/components/ui/UiComponents'

type QuizAdvancedRawEditorProps = {
  showRawEditor: boolean
  answerKeys: string
  questionBankText: string
  onToggleRawEditor: () => void
  onAnswerKeysChange: (value: string) => void
  onQuestionBankTextChange: (value: string) => void
}

export default function QuizAdvancedRawEditor({
  showRawEditor,
  answerKeys,
  questionBankText,
  onToggleRawEditor,
  onAnswerKeysChange,
  onQuestionBankTextChange,
}: QuizAdvancedRawEditorProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">高级模式</p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={onToggleRawEditor}>
          {showRawEditor ? '收起原始文本' : '展开原始文本'}
        </Button>
      </div>

      {showRawEditor ? (
        <div className="mt-4 grid gap-3">
          <Label htmlFor="quiz-answers">客观题答案键（选填，无题库时使用）</Label>
          <Input
            id="quiz-answers"
            placeholder="例如：A,C,B,D"
            value={answerKeys}
            onChange={(event) => onAnswerKeysChange(event.target.value)}
          />
          <p className="text-xs text-slate-500">
            当你没有录入结构化题库时，系统会根据答案键自动生成默认客观题。
          </p>

          <Label htmlFor="quiz-bank">原始题库文本（选填）</Label>
          <Textarea
            id="quiz-bank"
            className="min-h-28 bg-white"
            placeholder="每行一题：题型::题干::分值::选项A|选项B|选项C|选项D::正确答案::解析"
            value={questionBankText}
            onChange={(event) => onQuestionBankTextChange(event.target.value)}
          />
          <p className="text-xs text-slate-500">
            题型可填写 `single_choice`、`multiple_choice`、`true_false`、`fill_blank`、`subjective`。
            如果使用旧格式，系统也会兼容读取。
          </p>
        </div>
      ) : null}
    </div>
  )
}
