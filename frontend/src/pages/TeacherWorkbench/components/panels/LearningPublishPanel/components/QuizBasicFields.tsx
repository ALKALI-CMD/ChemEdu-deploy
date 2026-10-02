import type { Course } from '@/objects/course/catalog/Course'
import { Input, Label } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

type QuizBasicFieldsProps = {
  courseOptions: Course[]
  quizCourseId: string
  quizTitle: string
  durationMinutes: string
  objectiveQuestionCount: string
  subjectiveQuestionCount: string
  drawCount: string
  onCourseIdChange: (value: string) => void
  onTitleChange: (value: string) => void
  onDurationMinutesChange: (value: string) => void
  onObjectiveQuestionCountChange: (value: string) => void
  onSubjectiveQuestionCountChange: (value: string) => void
  onDrawCountChange: (value: string) => void
}

export default function QuizBasicFields({
  courseOptions,
  quizCourseId,
  quizTitle,
  durationMinutes,
  objectiveQuestionCount,
  subjectiveQuestionCount,
  drawCount,
  onCourseIdChange,
  onTitleChange,
  onDurationMinutesChange,
  onObjectiveQuestionCountChange,
  onSubjectiveQuestionCountChange,
  onDrawCountChange,
}: QuizBasicFieldsProps) {
  return (
    <>
      <Label htmlFor="quiz-course">所属课程（必填）</Label>
      <select
        id="quiz-course"
        required
        aria-required="true"
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        value={quizCourseId}
        onChange={(event) => onCourseIdChange(event.target.value)}
      >
        {courseOptions.map((course) => (
          <option key={course.id} value={course.id}>
            {zh(course.title)}
          </option>
        ))}
      </select>

      <Label htmlFor="quiz-title">测验标题（必填）</Label>
      <Input
        id="quiz-title"
        required
        aria-required="true"
        value={quizTitle}
        onChange={(event) => onTitleChange(event.target.value)}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="quiz-duration">考试时长（必填，分钟）</Label>
          <Input
            id="quiz-duration"
            required
            aria-required="true"
            type="number"
            min={1}
            step={5}
            value={durationMinutes}
            onChange={(event) => onDurationMinutesChange(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quiz-objective">客观题数量（选填，兜底）</Label>
          <Input
            id="quiz-objective"
            type="number"
            min={0}
            value={objectiveQuestionCount}
            onChange={(event) => onObjectiveQuestionCountChange(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quiz-subjective">主观题数量（选填，兜底）</Label>
          <Input
            id="quiz-subjective"
            type="number"
            min={0}
            value={subjectiveQuestionCount}
            onChange={(event) => onSubjectiveQuestionCountChange(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quiz-draw-count">随机抽题数（选填）</Label>
          <Input
            id="quiz-draw-count"
            type="number"
            min={0}
            placeholder="留空表示全卷"
            value={drawCount}
            onChange={(event) => onDrawCountChange(event.target.value)}
          />
        </div>
      </div>
    </>
  )
}
