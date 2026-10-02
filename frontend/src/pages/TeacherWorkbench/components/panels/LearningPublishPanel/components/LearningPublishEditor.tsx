import AssignmentPublishForm from './AssignmentPublishForm'
import QuizPublishForm from './QuizPublishForm'
import type { LearningPublishMode } from './LearningPublishModeTabs'
import type { useLearningPublishState } from '../hooks/useLearningPublishState'

type LearningPublishEditorProps = {
  publishType: LearningPublishMode
  publishState: ReturnType<typeof useLearningPublishState>
  publishing: boolean
  onPreviewAssignment: () => void
  onPreviewQuiz: () => void
  onPublishAssignment: () => void
  onPublishQuiz: () => void
}

export default function LearningPublishEditor({
  publishType,
  publishState,
  publishing,
  onPreviewAssignment,
  onPreviewQuiz,
  onPublishAssignment,
  onPublishQuiz,
}: LearningPublishEditorProps) {
  if (publishType === 'assignment') {
    return (
      <AssignmentPublishForm
        courseOptions={publishState.courseOptions}
        assignmentCourseId={publishState.assignmentCourseId}
        setAssignmentCourseId={publishState.setAssignmentCourseId}
        assignmentTitle={publishState.assignmentTitle}
        setAssignmentTitle={publishState.setAssignmentTitle}
        assignmentDescription={publishState.assignmentDescription}
        setAssignmentDescription={publishState.setAssignmentDescription}
        assignmentDeadline={publishState.assignmentDeadline}
        setAssignmentDeadline={publishState.setAssignmentDeadline}
        assignmentAttachmentLabel={publishState.assignmentAttachmentLabel}
        setAssignmentAttachmentLabel={publishState.setAssignmentAttachmentLabel}
        assignmentMaxAttempts={publishState.assignmentMaxAttempts}
        setAssignmentMaxAttempts={publishState.setAssignmentMaxAttempts}
        allowLateSubmission={publishState.allowLateSubmission}
        setAllowLateSubmission={publishState.setAllowLateSubmission}
        allowResubmission={publishState.allowResubmission}
        setAllowResubmission={publishState.setAllowResubmission}
        allowMakeUpSubmission={publishState.allowMakeUpSubmission}
        setAllowMakeUpSubmission={publishState.setAllowMakeUpSubmission}
        lateSubmissionDeadline={publishState.lateSubmissionDeadline}
        setLateSubmissionDeadline={publishState.setLateSubmissionDeadline}
        latePenaltyPercentPerDay={publishState.latePenaltyPercentPerDay}
        setLatePenaltyPercentPerDay={publishState.setLatePenaltyPercentPerDay}
        latePenaltyCapPercent={publishState.latePenaltyCapPercent}
        setLatePenaltyCapPercent={publishState.setLatePenaltyCapPercent}
        assignmentRubricText={publishState.assignmentRubricText}
        setAssignmentRubricText={publishState.setAssignmentRubricText}
        assignmentReferenceLabels={publishState.assignmentReferenceLabels}
        setAssignmentReferenceLabels={publishState.setAssignmentReferenceLabels}
        publishing={publishing}
        onPreview={onPreviewAssignment}
        onPublish={onPublishAssignment}
      />
    )
  }

  return (
    <QuizPublishForm
      courseOptions={publishState.courseOptions}
      quizCourseId={publishState.quizCourseId}
      setQuizCourseId={publishState.setQuizCourseId}
      quizTitle={publishState.quizTitle}
      setQuizTitle={publishState.setQuizTitle}
      durationMinutes={publishState.durationMinutes}
      setDurationMinutes={publishState.setDurationMinutes}
      objectiveQuestionCount={publishState.objectiveQuestionCount}
      setObjectiveQuestionCount={publishState.setObjectiveQuestionCount}
      subjectiveQuestionCount={publishState.subjectiveQuestionCount}
      setSubjectiveQuestionCount={publishState.setSubjectiveQuestionCount}
      drawCount={publishState.drawCount}
      setDrawCount={publishState.setDrawCount}
      shuffleQuestions={publishState.shuffleQuestions}
      setShuffleQuestions={publishState.setShuffleQuestions}
      shuffleOptions={publishState.shuffleOptions}
      setShuffleOptions={publishState.setShuffleOptions}
      answerKeys={publishState.answerKeys}
      setAnswerKeys={publishState.setAnswerKeys}
      questionBankText={publishState.questionBankText}
      setQuestionBankText={publishState.setQuestionBankText}
      publishing={publishing}
      onPreview={onPreviewQuiz}
      onPublish={onPublishQuiz}
    />
  )
}
