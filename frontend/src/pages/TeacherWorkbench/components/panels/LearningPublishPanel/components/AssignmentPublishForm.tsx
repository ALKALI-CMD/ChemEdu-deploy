import type { Course } from '@/objects/course/catalog/Course'
import AssignmentBasicFields from './AssignmentBasicFields'
import AssignmentRubricEditor from './AssignmentRubricEditor'
import AssignmentSubmissionPolicyFields from './AssignmentSubmissionPolicyFields'
import LearningPublishFormActions from './LearningPublishFormActions'

type AssignmentPublishFormProps = {
  courseOptions: Course[]
  assignmentCourseId: string
  setAssignmentCourseId: (value: string) => void
  assignmentTitle: string
  setAssignmentTitle: (value: string) => void
  assignmentDescription: string
  setAssignmentDescription: (value: string) => void
  assignmentDeadline: string
  setAssignmentDeadline: (value: string) => void
  assignmentAttachmentLabel: string
  setAssignmentAttachmentLabel: (value: string) => void
  assignmentMaxAttempts: string
  setAssignmentMaxAttempts: (value: string) => void
  allowLateSubmission: boolean
  setAllowLateSubmission: (value: boolean) => void
  allowResubmission: boolean
  setAllowResubmission: (value: boolean) => void
  allowMakeUpSubmission: boolean
  setAllowMakeUpSubmission: (value: boolean) => void
  lateSubmissionDeadline: string
  setLateSubmissionDeadline: (value: string) => void
  latePenaltyPercentPerDay: string
  setLatePenaltyPercentPerDay: (value: string) => void
  latePenaltyCapPercent: string
  setLatePenaltyCapPercent: (value: string) => void
  assignmentRubricText: string
  setAssignmentRubricText: (value: string) => void
  assignmentReferenceLabels: string
  setAssignmentReferenceLabels: (value: string) => void
  publishing: boolean
  onPreview: () => void
  onPublish: () => void
}

export default function AssignmentPublishForm({
  courseOptions,
  assignmentCourseId,
  setAssignmentCourseId,
  assignmentTitle,
  setAssignmentTitle,
  assignmentDescription,
  setAssignmentDescription,
  assignmentDeadline,
  setAssignmentDeadline,
  assignmentAttachmentLabel,
  setAssignmentAttachmentLabel,
  assignmentMaxAttempts,
  setAssignmentMaxAttempts,
  allowLateSubmission,
  setAllowLateSubmission,
  allowResubmission,
  setAllowResubmission,
  allowMakeUpSubmission,
  setAllowMakeUpSubmission,
  lateSubmissionDeadline,
  setLateSubmissionDeadline,
  latePenaltyPercentPerDay,
  setLatePenaltyPercentPerDay,
  latePenaltyCapPercent,
  setLatePenaltyCapPercent,
  assignmentRubricText,
  setAssignmentRubricText,
  assignmentReferenceLabels,
  setAssignmentReferenceLabels,
  publishing,
  onPreview,
  onPublish,
}: AssignmentPublishFormProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">发布作业</h3>
      <div className="mt-4 grid gap-3">
        <AssignmentBasicFields
          courseOptions={courseOptions}
          assignmentCourseId={assignmentCourseId}
          assignmentTitle={assignmentTitle}
          assignmentDescription={assignmentDescription}
          assignmentDeadline={assignmentDeadline}
          assignmentAttachmentLabel={assignmentAttachmentLabel}
          assignmentReferenceLabels={assignmentReferenceLabels}
          onCourseIdChange={setAssignmentCourseId}
          onTitleChange={setAssignmentTitle}
          onDescriptionChange={setAssignmentDescription}
          onDeadlineChange={setAssignmentDeadline}
          onAttachmentLabelChange={setAssignmentAttachmentLabel}
          onReferenceLabelsChange={setAssignmentReferenceLabels}
        />

        <AssignmentSubmissionPolicyFields
          assignmentMaxAttempts={assignmentMaxAttempts}
          allowLateSubmission={allowLateSubmission}
          allowResubmission={allowResubmission}
          allowMakeUpSubmission={allowMakeUpSubmission}
          lateSubmissionDeadline={lateSubmissionDeadline}
          latePenaltyPercentPerDay={latePenaltyPercentPerDay}
          latePenaltyCapPercent={latePenaltyCapPercent}
          onMaxAttemptsChange={setAssignmentMaxAttempts}
          onAllowLateSubmissionChange={setAllowLateSubmission}
          onAllowResubmissionChange={setAllowResubmission}
          onAllowMakeUpSubmissionChange={setAllowMakeUpSubmission}
          onLateSubmissionDeadlineChange={setLateSubmissionDeadline}
          onLatePenaltyPercentPerDayChange={setLatePenaltyPercentPerDay}
          onLatePenaltyCapPercentChange={setLatePenaltyCapPercent}
        />

        <AssignmentRubricEditor
          assignmentRubricText={assignmentRubricText}
          setAssignmentRubricText={setAssignmentRubricText}
        />

        <LearningPublishFormActions
          publishing={publishing}
          disablePublish={courseOptions.length === 0}
          previewLabel="预览作业发布"
          publishLabel="直接发布作业"
          onPreview={onPreview}
          onPublish={onPublish}
        />
      </div>
    </div>
  )
}
