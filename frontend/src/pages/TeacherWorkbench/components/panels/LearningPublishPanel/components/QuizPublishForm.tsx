import { useState } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import LearningPublishFormActions from './LearningPublishFormActions'
import QuizAdvancedRawEditor from './QuizAdvancedRawEditor'
import QuizBasicFields from './QuizBasicFields'
import QuizDeliveryOptions from './QuizDeliveryOptions'
import StructuredQuizQuestionEditor from './StructuredQuizQuestionEditor'

type QuizPublishFormProps = {
  courseOptions: Course[]
  quizCourseId: string
  setQuizCourseId: (value: string) => void
  quizTitle: string
  setQuizTitle: (value: string) => void
  durationMinutes: string
  setDurationMinutes: (value: string) => void
  objectiveQuestionCount: string
  setObjectiveQuestionCount: (value: string) => void
  subjectiveQuestionCount: string
  setSubjectiveQuestionCount: (value: string) => void
  drawCount: string
  setDrawCount: (value: string) => void
  shuffleQuestions: boolean
  setShuffleQuestions: (value: boolean) => void
  shuffleOptions: boolean
  setShuffleOptions: (value: boolean) => void
  answerKeys: string
  setAnswerKeys: (value: string) => void
  questionBankText: string
  setQuestionBankText: (value: string) => void
  publishing: boolean
  onPreview: () => void
  onPublish: () => void
}

export default function QuizPublishForm({
  courseOptions,
  quizCourseId,
  setQuizCourseId,
  quizTitle,
  setQuizTitle,
  durationMinutes,
  setDurationMinutes,
  objectiveQuestionCount,
  setObjectiveQuestionCount,
  subjectiveQuestionCount,
  setSubjectiveQuestionCount,
  drawCount,
  setDrawCount,
  shuffleQuestions,
  setShuffleQuestions,
  shuffleOptions,
  setShuffleOptions,
  answerKeys,
  setAnswerKeys,
  questionBankText,
  setQuestionBankText,
  publishing,
  onPreview,
  onPublish,
}: QuizPublishFormProps) {
  const [showRawEditor, setShowRawEditor] = useState(false)

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">发布测验</h3>
      <div className="mt-4 grid gap-3">
        <QuizBasicFields
          courseOptions={courseOptions}
          quizCourseId={quizCourseId}
          quizTitle={quizTitle}
          durationMinutes={durationMinutes}
          objectiveQuestionCount={objectiveQuestionCount}
          subjectiveQuestionCount={subjectiveQuestionCount}
          drawCount={drawCount}
          onCourseIdChange={setQuizCourseId}
          onTitleChange={setQuizTitle}
          onDurationMinutesChange={setDurationMinutes}
          onObjectiveQuestionCountChange={setObjectiveQuestionCount}
          onSubjectiveQuestionCountChange={setSubjectiveQuestionCount}
          onDrawCountChange={setDrawCount}
        />

        <QuizDeliveryOptions
          shuffleQuestions={shuffleQuestions}
          shuffleOptions={shuffleOptions}
          onShuffleQuestionsChange={setShuffleQuestions}
          onShuffleOptionsChange={setShuffleOptions}
        />

        <StructuredQuizQuestionEditor value={questionBankText} onChange={setQuestionBankText} />

        <QuizAdvancedRawEditor
          showRawEditor={showRawEditor}
          answerKeys={answerKeys}
          questionBankText={questionBankText}
          onToggleRawEditor={() => setShowRawEditor((current) => !current)}
          onAnswerKeysChange={setAnswerKeys}
          onQuestionBankTextChange={setQuestionBankText}
        />

        <LearningPublishFormActions
          publishing={publishing}
          disablePublish={courseOptions.length === 0}
          previewLabel="预览测验发布"
          publishLabel="直接发布测验"
          onPreview={onPreview}
          onPublish={onPublish}
        />
      </div>
    </div>
  )
}
