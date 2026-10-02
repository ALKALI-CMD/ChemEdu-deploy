import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import { Input, Label, Textarea } from '@/components/ui/UiComponents'
import type { EditableQuestion } from '../functions/structuredQuizQuestionModel'

type StructuredQuizQuestionAnswerFieldsProps = {
  question: EditableQuestion
  onChange: (question: EditableQuestion) => void
}

function getAnswerHint(type: QuizQuestionType) {
  if (type === QuizQuestionType.MultipleChoice) return '多选题用 | 分隔，例如 A|C'
  if (type === QuizQuestionType.FillBlank) return '填空题可写多个标准答案，用 | 分隔'
  if (type === QuizQuestionType.Subjective) return '主观题可留空'
  return '例如 A'
}

export default function StructuredQuizQuestionAnswerFields({
  question,
  onChange,
}: StructuredQuizQuestionAnswerFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label>
          正确答案
          <span className="ml-2 text-xs font-normal text-slate-500">{getAnswerHint(question.type)}</span>
        </Label>
        <Input
          required={question.type !== QuizQuestionType.Subjective}
          aria-required={question.type !== QuizQuestionType.Subjective}
          value={question.correctAnswers.join('|')}
          onChange={(event) =>
            onChange({
              ...question,
              correctAnswers: event.target.value
                .split('|')
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          placeholder={question.type === QuizQuestionType.Subjective ? '主观题可不填写标准答案（选填）' : '输入正确答案（必填）'}
        />
      </div>

      <div className="grid gap-2">
        <Label>题目解析（选填）</Label>
        <Textarea
          className="min-h-20 bg-white"
          placeholder="学生提交后会看到这里的解析"
          value={question.explanation}
          onChange={(event) => onChange({ ...question, explanation: event.target.value })}
        />
      </div>
    </>
  )
}
