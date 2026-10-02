import { createContext, useContext } from 'react'
import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import type { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { NotificationSetting } from '@/objects/course/discussion/NotificationSetting'
import type { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import type { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import type { PaymentMethod } from '@/lib/paymentMethods'
import type { EnrollmentMessageResponse } from '@/objects/course/enrollment/apiTypes/EnrollmentMessageResponse'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentRubricScore } from '@/objects/course/learning/AssignmentRubricScore'
import type { LessonProgressStatus } from '@/objects/course/learning/LessonProgressStatus'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { QuizOption } from '@/objects/course/learning/QuizOption'
import type { TeacherAnnotation } from '@/objects/course/learning/TeacherAnnotation'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import type { UpdateProfilePayload } from '@/api/auth/UpdateProfileAPIMessage'
import type { PublishAssignmentPayload } from '@/api/course/learning/PublishAssignmentAPIMessage'
import type { PublishQuizPayload } from '@/api/course/learning/PublishQuizAPIMessage'

export type EducationDashboardContextValue = {
  dashboard: EducationDashboardResponse | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  saveCourse: (input: CourseEditorInput) => Promise<Course>
  updateCourseStatus: (courseId: string, status: CourseStatus) => Promise<Course>
  deleteCourse: (courseId: string) => Promise<string>
  enroll: (courseId: string, paymentMethod?: PaymentMethod, inviteCode?: string) => Promise<EnrollmentMessageResponse>
  submitCourseReview: (courseId: Course['id'], rating: number, content: string) => Promise<CourseReview>
  publishAssignment: (payload: PublishAssignmentPayload) => Promise<Assignment>
  submitAssignment: (
    assignmentId: string,
    submissionContent: string,
    submissionAttachments: AssignmentAttachment[],
    submissionNote?: string,
  ) => Promise<Assignment>
  reviewAssignment: (
    assignmentId: string,
    score: number,
    feedback: string,
    reviewAttachments: AssignmentAttachment[],
    rubricScores?: AssignmentRubricScore[],
    teacherAnnotations?: TeacherAnnotation[],
  ) => Promise<Assignment>
  publishQuiz: (payload: PublishQuizPayload) => Promise<Quiz>
  reviewQuiz: (quizId: string, subjectiveScore: number, feedback?: string) => Promise<Quiz>
  submitQuiz: (
    quizId: string,
    objectiveAnswers: QuizOption[],
    subjectiveAnswer?: string,
    fillBlankAnswers?: string[],
    answerRecords?: Quiz['objectiveAnswerRecord'],
  ) => Promise<Quiz>
  updateLessonProgress: (
    lessonId: string,
    status: LessonProgressStatus,
    studyMinutes?: number,
    lastPositionSeconds?: number,
    completedPreviewResourceIds?: string[],
    playbackRate?: number,
    eventType?: string,
  ) => Promise<void>
  createDiscussionTopic: (
    courseId: Course['id'],
    lessonId: string | undefined,
    title: string,
    content: string,
  ) => Promise<DiscussionTopic>
  replyDiscussionTopic: (topicId: string, content: string) => Promise<DiscussionTopic>
  updateDiscussionTopic: (topicId: string, title: string, content: string) => Promise<DiscussionTopic>
  deleteDiscussionTopic: (topicId: string) => Promise<string>
  updateDiscussionReply: (replyId: string, content: string) => Promise<DiscussionTopic>
  deleteDiscussionReply: (replyId: string) => Promise<DiscussionTopic>
  moderateDiscussionTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved: boolean,
    moderationNote?: string,
  ) => Promise<DiscussionTopic>
  moderateDiscussionReply: (
    replyId: string,
    visibility: DiscussionVisibility,
    moderationNote?: string,
  ) => Promise<DiscussionTopic>
  toggleDiscussionReaction: (topicId: string, reactionType: 'like' | 'favorite' | 'report') => Promise<DiscussionTopic>
  createPlatformReport: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
  resolvePlatformReport: (
    reportId: string,
    status: string,
    resolutionNote?: string,
  ) => Promise<PlatformReport>
  markNotificationRead: (notificationId: string | undefined, read: boolean) => Promise<string>
  updateNotificationSetting: (category: NotificationSetting['category'], enabled: boolean) => Promise<string>
  updateProfile: (input: UpdateProfilePayload) => Promise<UserProfile>
  changePassword: (currentPassword: string, newPassword: string) => Promise<string>
  updateUserAccess: (userId: UserId, role: UserRole, permissions: string[]) => Promise<UserProfile>
  auditCourse: (courseId: Course['id'], auditStatus: CourseAuditStatus, auditComment: string) => Promise<Course>
  saveDepartment: (input: { departmentId?: string; name: string }) => Promise<Department>
  saveMajor: (input: { majorId?: string; departmentId: string; name: string }) => Promise<Major>
  saveAcademicClass: (input: { academicClassId?: string; majorId: string; grade: string; name: string; capacity: number }) => Promise<AcademicClass>
  saveSemester: (input: { semesterId?: string; label: string; startAt: string; endAt: string; archived: boolean }) => Promise<SemesterTerm>
  deleteDepartment: (departmentId: string) => Promise<string>
  deleteMajor: (majorId: string) => Promise<string>
  deleteAcademicClass: (academicClassId: string) => Promise<string>
  deleteSemester: (semesterId: string) => Promise<string>
  assignStudentsToAcademicClass: (academicClassId: string, studentIds: string[]) => Promise<string>
  clearStudentsAcademicClass: (studentIds: string[]) => Promise<string>
  updateCourseAcademicClasses: (courseId: Course['id'], academicClassIds: string[]) => Promise<Course>
  reviewEnrollment: (courseId: Course['id'], userId: UserId, approved: boolean) => Promise<string>
  promoteWaitlistEntry: (courseId: Course['id'], userId: UserId) => Promise<string>
  archiveSemester: (semesterId: string, archiveCourses: boolean) => Promise<string>
}

export const EducationDashboardContext = createContext<EducationDashboardContextValue | null>(null)

export function useEducationDashboard() {
  const context = useContext(EducationDashboardContext)

  if (!context) {
    throw new Error('useEducationDashboard 必须在 EducationDashboardProvider 内使用。')
  }

  return context
}
