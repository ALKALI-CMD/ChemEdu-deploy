import type { PublishAssignmentPayload } from '@/api/course/learning/PublishAssignmentAPIMessage'
import type { PublishQuizPayload } from '@/api/course/learning/PublishQuizAPIMessage'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import LearningPublishEditor from './components/LearningPublishEditor'
import LearningPublishFeedback from './components/LearningPublishFeedback'
import LearningPublishModeTabs, { type LearningPublishMode } from './components/LearningPublishModeTabs'
import LearningPublishPreview from './components/LearningPublishPreview'
import { useLearningPublishActions } from './hooks/useLearningPublishActions'
import useLearningPublishPreviewSummary from './hooks/useLearningPublishPreviewSummary'
import { useLearningPublishState } from './hooks/useLearningPublishState'

type LearningPublishPanelProps = {
  courses: Course[]
  publishing: boolean
  onPublishAssignment: (payload: PublishAssignmentPayload) => Promise<void>
  onPublishQuiz: (payload: PublishQuizPayload) => Promise<void>
}

export default function LearningPublishPanel({
  courses,
  publishing,
  onPublishAssignment,
  onPublishQuiz,
}: LearningPublishPanelProps) {
  const [publishType, setPublishType] = useState<LearningPublishMode>('assignment')
  const publishState = useLearningPublishState(courses)
  const {
    courseOptions,
    assignmentCourseId,
    assignmentTitle,
    assignmentDescription,
    assignmentDeadline,
    assignmentAttachmentLabel,
    assignmentMaxAttempts,
    allowLateSubmission,
    allowResubmission,
    assignmentRubricText,
    assignmentReferenceLabels,
    quizCourseId,
    quizTitle,
    durationMinutes,
    objectiveQuestionCount,
    subjectiveQuestionCount,
    drawCount,
    shuffleQuestions,
    shuffleOptions,
    answerKeys,
    questionBankText,
    formError,
    previewMode,
    setPreviewMode,
    publishSuccess,
    previewCourseTitle,
  } = publishState
  const { handlePublishAssignment, handlePublishQuiz } = useLearningPublishActions({
    state: publishState,
    onPublishAssignment,
    onPublishQuiz,
  })

  const previewSummary = useLearningPublishPreviewSummary({
    assignmentRubricText,
    assignmentReferenceLabels,
    questionBankText,
  })

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-slate-950">作业与测验发布</CardTitle>
        <LearningPublishModeTabs value={publishType} onChange={setPublishType} />
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-6">
          <LearningPublishFeedback
            courseOptionsLength={courseOptions.length}
            formError={formError}
            publishSuccess={publishSuccess}
          />
          <LearningPublishEditor
            publishType={publishType}
            publishState={publishState}
            publishing={publishing}
            onPreviewAssignment={() => setPreviewMode('assignment')}
            onPreviewQuiz={() => setPreviewMode('quiz')}
            onPublishAssignment={() => void handlePublishAssignment()}
            onPublishQuiz={() => void handlePublishQuiz()}
          />
        </div>

        {previewMode ? (
          <LearningPublishPreview
            previewMode={previewMode}
            previewCourseTitle={previewCourseTitle}
            assignmentCourseId={assignmentCourseId}
            assignmentTitle={assignmentTitle}
            assignmentDeadline={assignmentDeadline}
            assignmentAttachmentLabel={assignmentAttachmentLabel}
            assignmentDescription={assignmentDescription}
            assignmentMaxAttempts={assignmentMaxAttempts}
            allowLateSubmission={allowLateSubmission}
            allowResubmission={allowResubmission}
            assignmentRubricCount={previewSummary.assignmentRubricCount}
            assignmentReferenceCount={previewSummary.assignmentReferenceCount}
            quizCourseId={quizCourseId}
            quizTitle={quizTitle}
            durationMinutes={durationMinutes}
            objectiveQuestionCount={objectiveQuestionCount}
            subjectiveQuestionCount={subjectiveQuestionCount}
            drawCount={drawCount}
            shuffleQuestions={shuffleQuestions}
            shuffleOptions={shuffleOptions}
            questionBankQuestionCount={previewSummary.questionBankQuestionCount}
            questionBankTotalPoints={previewSummary.questionBankTotalPoints}
            answerKeys={answerKeys}
            publishing={publishing}
            onPublishAssignment={() => void handlePublishAssignment()}
            onPublishQuiz={() => void handlePublishQuiz()}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
