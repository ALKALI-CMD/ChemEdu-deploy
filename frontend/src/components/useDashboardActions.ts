import { useMemo } from 'react'
import { sendAPI } from '@/lib/apiClient'
import { createArchiveSemesterRequest } from '@/api/admin/ArchiveSemesterAPIMessage'
import { createAssignStudentsToAcademicClassRequest } from '@/api/admin/AssignStudentsToAcademicClassAPIMessage'
import { createAuditCourseRequest } from '@/api/admin/AuditCourseAPIMessage'
import { createClearStudentsAcademicClassRequest } from '@/api/admin/ClearStudentsAcademicClassAPIMessage'
import { createDeleteAcademicClassRequest } from '@/api/admin/DeleteAcademicClassAPIMessage'
import { createDeleteDepartmentRequest } from '@/api/admin/DeleteDepartmentAPIMessage'
import { createDeleteMajorRequest } from '@/api/admin/DeleteMajorAPIMessage'
import { createDeleteSemesterRequest } from '@/api/admin/DeleteSemesterAPIMessage'
import { createPromoteWaitlistEntryRequest } from '@/api/admin/PromoteWaitlistEntryAPIMessage'
import { createReviewEnrollmentRequest } from '@/api/admin/ReviewEnrollmentAPIMessage'
import { createUpdateCourseAcademicClassesRequest } from '@/api/admin/UpdateCourseAcademicClassesAPIMessage'
import { createUpdateUserAccessRequest } from '@/api/admin/UpdateUserAccessAPIMessage'
import { createUpsertAcademicClassRequest } from '@/api/admin/UpsertAcademicClassAPIMessage'
import { createUpsertDepartmentRequest } from '@/api/admin/UpsertDepartmentAPIMessage'
import { createUpsertMajorRequest } from '@/api/admin/UpsertMajorAPIMessage'
import { createUpsertSemesterRequest } from '@/api/admin/UpsertSemesterAPIMessage'
import { createChangePasswordRequest } from '@/api/auth/ChangePasswordAPIMessage'
import { createDeleteCourseRequest } from '@/api/course/catalog/DeleteCourseAPIMessage'
import { createUpdateCourseStatusRequest } from '@/api/course/catalog/UpdateCourseStatusAPIMessage'
import { createUpsertCourseRequest } from '@/api/course/catalog/UpsertCourseAPIMessage'
import { createDiscussionTopicRequest } from '@/api/course/discussion/CreateDiscussionTopicAPIMessage'
import { createPlatformReportRequest } from '@/api/course/discussion/CreatePlatformReportAPIMessage'
import { createDeleteDiscussionReplyRequest } from '@/api/course/discussion/DeleteDiscussionReplyAPIMessage'
import { createDeleteDiscussionTopicRequest } from '@/api/course/discussion/DeleteDiscussionTopicAPIMessage'
import { createMarkNotificationReadRequest } from '@/api/course/discussion/MarkNotificationReadAPIMessage'
import { createModerateDiscussionReplyRequest } from '@/api/course/discussion/ModerateDiscussionReplyAPIMessage'
import { createModerateDiscussionTopicRequest } from '@/api/course/discussion/ModerateDiscussionTopicAPIMessage'
import { createReplyDiscussionTopicRequest } from '@/api/course/discussion/ReplyDiscussionTopicAPIMessage'
import { createResolvePlatformReportRequest } from '@/api/course/discussion/ResolvePlatformReportAPIMessage'
import { createToggleDiscussionReactionRequest } from '@/api/course/discussion/ToggleDiscussionReactionAPIMessage'
import { createUpdateDiscussionReplyRequest } from '@/api/course/discussion/UpdateDiscussionReplyAPIMessage'
import { createUpdateDiscussionTopicRequest } from '@/api/course/discussion/UpdateDiscussionTopicAPIMessage'
import { createUpdateNotificationSettingRequest } from '@/api/course/discussion/UpdateNotificationSettingAPIMessage'
import { createEnrollCourseRequest } from '@/api/course/enrollment/EnrollCourseAPIMessage'
import { createPublishAssignmentRequest } from '@/api/course/learning/PublishAssignmentAPIMessage'
import { createPublishQuizRequest } from '@/api/course/learning/PublishQuizAPIMessage'
import { createReviewAssignmentRequest } from '@/api/course/learning/ReviewAssignmentAPIMessage'
import { createReviewQuizRequest } from '@/api/course/learning/ReviewQuizAPIMessage'
import { createSubmitAssignmentRequest } from '@/api/course/learning/SubmitAssignmentAPIMessage'
import { createSubmitQuizRequest } from '@/api/course/learning/SubmitQuizAPIMessage'
import { createUpdateLessonProgressRequest } from '@/api/course/learning/UpdateLessonProgressAPIMessage'
import { createSubmitCourseReviewRequest } from '@/api/course/review/SubmitCourseReviewAPIMessage'
import { createUpdateProfileRequest } from '@/api/auth/UpdateProfileAPIMessage'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'

const loginRequiredMessage = 'Please log in first.'

type DashboardActions = Omit<EducationDashboardContextValue, 'dashboard' | 'loading' | 'error' | 'refresh'>

type UseDashboardActionsInput = {
  session: AuthSessionResponse | null
  refreshDashboard: () => Promise<void>
  updateSessionUser: (user: AuthSessionResponse['user']) => void
}

export function useDashboardActions({
  session,
  refreshDashboard,
  updateSessionUser,
}: UseDashboardActionsInput): DashboardActions {
  return useMemo<DashboardActions>(() => {
    function requireSession(): AuthSessionResponse {
      if (!session) throw new Error(loginRequiredMessage)
      return session
    }

    async function mutateAndRefresh<T>(mutation: (sessionToken: AuthSessionResponse['sessionToken']) => Promise<T>): Promise<T> {
      const currentSession = requireSession()
      const result = await mutation(currentSession.sessionToken)
      await refreshDashboard()
      return result
    }

    return {
      saveCourse(input) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpsertCourseRequest(sessionToken, input)))
      },
      updateCourseStatus(courseId, status) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpdateCourseStatusRequest(sessionToken, courseId, status)))
      },
      deleteCourse(courseId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteCourseRequest(sessionToken, courseId)))
      },
      enroll(courseId, paymentMethod, inviteCode) {
        return mutateAndRefresh((sessionToken) => sendAPI(createEnrollCourseRequest(sessionToken, courseId, inviteCode, paymentMethod)))
      },
      submitCourseReview(courseId, rating, content) {
        return mutateAndRefresh((sessionToken) => sendAPI(createSubmitCourseReviewRequest(sessionToken, courseId, rating, content)))
      },
      publishAssignment(payload) {
        return mutateAndRefresh((sessionToken) => sendAPI(createPublishAssignmentRequest(sessionToken, payload)))
      },
      submitAssignment(assignmentId, submissionContent, submissionAttachments, submissionNote) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createSubmitAssignmentRequest(sessionToken, assignmentId, submissionContent, submissionAttachments, submissionNote)),
        )
      },
      reviewAssignment(assignmentId, score, feedback, reviewAttachments, rubricScores, teacherAnnotations) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(
            createReviewAssignmentRequest(
              sessionToken,
              assignmentId,
              score,
              feedback,
              reviewAttachments,
              rubricScores,
              teacherAnnotations,
            ),
          ),
        )
      },
      publishQuiz(payload) {
        return mutateAndRefresh((sessionToken) => sendAPI(createPublishQuizRequest(sessionToken, payload)))
      },
      reviewQuiz(quizId, subjectiveScore, feedback) {
        return mutateAndRefresh((sessionToken) => sendAPI(createReviewQuizRequest(sessionToken, quizId, subjectiveScore, feedback)))
      },
      submitQuiz(quizId, objectiveAnswers, subjectiveAnswer, fillBlankAnswers, answerRecords) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createSubmitQuizRequest(sessionToken, quizId, objectiveAnswers, subjectiveAnswer, fillBlankAnswers, answerRecords)),
        )
      },
      async updateLessonProgress(
        lessonId,
        status,
        studyMinutes,
        lastPositionSeconds,
        completedPreviewResourceIds,
        playbackRate,
        eventType,
      ) {
        await mutateAndRefresh((sessionToken) =>
          sendAPI(
            createUpdateLessonProgressRequest(
              sessionToken,
              lessonId,
              status,
              studyMinutes,
              lastPositionSeconds,
              completedPreviewResourceIds,
              playbackRate,
              eventType,
            ),
          ),
        )
      },
      createDiscussionTopic(courseId, lessonId, title, content) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createDiscussionTopicRequest(sessionToken, courseId, lessonId, title, content)),
        )
      },
      replyDiscussionTopic(topicId, content) {
        return mutateAndRefresh((sessionToken) => sendAPI(createReplyDiscussionTopicRequest(sessionToken, topicId, content)))
      },
      updateDiscussionTopic(topicId, title, content) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpdateDiscussionTopicRequest(sessionToken, topicId, title, content)))
      },
      deleteDiscussionTopic(topicId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteDiscussionTopicRequest(sessionToken, topicId)))
      },
      updateDiscussionReply(replyId, content) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpdateDiscussionReplyRequest(sessionToken, replyId, content)))
      },
      deleteDiscussionReply(replyId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteDiscussionReplyRequest(sessionToken, replyId)))
      },
      moderateDiscussionTopic(topicId, visibility, threadState, pinState, resolved, moderationNote) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createModerateDiscussionTopicRequest(sessionToken, topicId, visibility, threadState, pinState, resolved, moderationNote)),
        )
      },
      moderateDiscussionReply(replyId, visibility, moderationNote) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createModerateDiscussionReplyRequest(sessionToken, replyId, visibility, moderationNote)),
        )
      },
      toggleDiscussionReaction(topicId, reactionType) {
        return mutateAndRefresh((sessionToken) => sendAPI(createToggleDiscussionReactionRequest(sessionToken, topicId, reactionType)))
      },
      createPlatformReport(targetType, targetId, targetLabel, reason, detail) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createPlatformReportRequest(sessionToken, targetType, targetId, targetLabel, reason, detail)),
        )
      },
      resolvePlatformReport(reportId, status, resolutionNote) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createResolvePlatformReportRequest(sessionToken, reportId, status, resolutionNote)),
        )
      },
      markNotificationRead(notificationId, read) {
        return mutateAndRefresh((sessionToken) => sendAPI(createMarkNotificationReadRequest(sessionToken, notificationId, read)))
      },
      updateNotificationSetting(category, enabled) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpdateNotificationSettingRequest(sessionToken, category, enabled)))
      },
      async updateProfile(input) {
        const currentSession = requireSession()
        const user = await sendAPI(createUpdateProfileRequest(currentSession.sessionToken, input))
        updateSessionUser(user)
        await refreshDashboard()
        return user
      },
      changePassword(currentPassword, newPassword) {
        const currentSession = requireSession()
        return sendAPI(createChangePasswordRequest(currentSession.sessionToken, currentPassword, newPassword))
      },
      updateUserAccess(userId, role, permissions) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpdateUserAccessRequest(sessionToken, userId, role, permissions)))
      },
      auditCourse(courseId, auditStatus, auditComment) {
        return mutateAndRefresh((sessionToken) => sendAPI(createAuditCourseRequest(sessionToken, courseId, auditStatus, auditComment)))
      },
      saveDepartment(input) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpsertDepartmentRequest(sessionToken, input)))
      },
      saveMajor(input) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpsertMajorRequest(sessionToken, input)))
      },
      saveAcademicClass(input) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpsertAcademicClassRequest(sessionToken, input)))
      },
      saveSemester(input) {
        return mutateAndRefresh((sessionToken) => sendAPI(createUpsertSemesterRequest(sessionToken, input)))
      },
      deleteDepartment(departmentId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteDepartmentRequest(sessionToken, departmentId)))
      },
      deleteMajor(majorId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteMajorRequest(sessionToken, majorId)))
      },
      deleteAcademicClass(academicClassId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteAcademicClassRequest(sessionToken, academicClassId)))
      },
      deleteSemester(semesterId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createDeleteSemesterRequest(sessionToken, semesterId)))
      },
      assignStudentsToAcademicClass(academicClassId, studentIds) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createAssignStudentsToAcademicClassRequest(sessionToken, academicClassId, studentIds)),
        )
      },
      clearStudentsAcademicClass(studentIds) {
        return mutateAndRefresh((sessionToken) => sendAPI(createClearStudentsAcademicClassRequest(sessionToken, studentIds)))
      },
      updateCourseAcademicClasses(courseId, academicClassIds) {
        return mutateAndRefresh((sessionToken) =>
          sendAPI(createUpdateCourseAcademicClassesRequest(sessionToken, courseId, academicClassIds)),
        )
      },
      reviewEnrollment(courseId, userId, approved) {
        return mutateAndRefresh((sessionToken) => sendAPI(createReviewEnrollmentRequest(sessionToken, courseId, userId, approved)))
      },
      promoteWaitlistEntry(courseId, userId) {
        return mutateAndRefresh((sessionToken) => sendAPI(createPromoteWaitlistEntryRequest(sessionToken, courseId, userId)))
      },
      archiveSemester(semesterId, archiveCourses) {
        return mutateAndRefresh((sessionToken) => sendAPI(createArchiveSemesterRequest(sessionToken, semesterId, archiveCourses)))
      },
    }
  }, [refreshDashboard, session, updateSessionUser])
}
