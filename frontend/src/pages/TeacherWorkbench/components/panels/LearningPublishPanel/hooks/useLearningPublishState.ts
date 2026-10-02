import { useEffect, useMemo, useState } from 'react'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import { QuizOption } from '@/objects/course/learning/QuizOption'
import { zh } from '@/lib/localization'

type PublishSuccess =
  | {
      type: 'assignment'
      courseId: string
      courseTitle: string
      title: string
      deadline?: string
    }
  | {
      type: 'quiz'
      courseId: string
      courseTitle: string
      title: string
      durationMinutes: number
    }

const quizOptions = [QuizOption.A, QuizOption.B, QuizOption.C, QuizOption.D]

function parseAnswerKeys(value: string): QuizOption[] {
  return value
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .map((item) => {
      if (!quizOptions.includes(item as QuizOption)) {
        throw new Error('客观题答案键只能填写 A、B、C、D，并使用英文逗号分隔。')
      }
      return item as QuizOption
    })
}

function useLearningPublishState(courses: Course[]) {
  const activeCourses = useMemo(
    () => courses.filter((course) => course.status === CourseStatus.Published || course.status === CourseStatus.Draft),
    [courses],
  )
  const courseOptions = activeCourses.length > 0 ? activeCourses : courses
  const firstCourseId = courseOptions[0]?.id ?? ''

  const [assignmentCourseId, setAssignmentCourseId] = useState<string>(firstCourseId)
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [assignmentDeadline, setAssignmentDeadline] = useState('')
  const [assignmentAttachmentLabel, setAssignmentAttachmentLabel] = useState('')
  const [assignmentMaxAttempts, setAssignmentMaxAttempts] = useState('2')
  const [allowLateSubmission, setAllowLateSubmission] = useState(true)
  const [allowResubmission, setAllowResubmission] = useState(true)
  const [allowMakeUpSubmission, setAllowMakeUpSubmission] = useState(false)
  const [lateSubmissionDeadline, setLateSubmissionDeadline] = useState('')
  const [latePenaltyPercentPerDay, setLatePenaltyPercentPerDay] = useState('0')
  const [latePenaltyCapPercent, setLatePenaltyCapPercent] = useState('0')
  const [assignmentRubricText, setAssignmentRubricText] = useState('')
  const [assignmentReferenceLabels, setAssignmentReferenceLabels] = useState('')

  const [quizCourseId, setQuizCourseId] = useState<string>(firstCourseId)
  const [quizTitle, setQuizTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('20')
  const [objectiveQuestionCount, setObjectiveQuestionCount] = useState('5')
  const [subjectiveQuestionCount, setSubjectiveQuestionCount] = useState('0')
  const [drawCount, setDrawCount] = useState('')
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [answerKeys, setAnswerKeys] = useState('')
  const [questionBankText, setQuestionBankText] = useState('')

  const [formError, setFormError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'assignment' | 'quiz' | null>(null)
  const [publishSuccess, setPublishSuccess] = useState<PublishSuccess | null>(null)

  useEffect(() => {
    setAssignmentCourseId((current) => current || firstCourseId)
    setQuizCourseId((current) => current || firstCourseId)
  }, [firstCourseId])

  const previewCourseTitle = (courseId: string) =>
    zh(courseOptions.find((course) => course.id === courseId)?.title ?? '未选择课程')

  return {
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
    formError,
    setFormError,
    previewMode,
    setPreviewMode,
    publishSuccess,
    setPublishSuccess,
    previewCourseTitle,
    parseAnswerKeys,
  }
}

export { useLearningPublishState }
export type { PublishSuccess }
