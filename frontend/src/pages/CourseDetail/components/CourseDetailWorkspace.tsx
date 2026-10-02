import { useState } from 'react'
import EducationShell from '@/components/EducationShell'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import { EmptyStateCard, InlineNotice, PermissionStateCard, type NoticeState, useAutoClearNotice } from '@/components/ExperienceState'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { zh } from '@/lib/localization'
import {
  canStudentViewCourse,
  getCourseDetailDescription,
} from '../functions/courseDetailUtils'
import { useCourseDetailWorkspaceModel } from '../hooks/useCourseDetailWorkspaceModel'
import { useCourseDetailActions } from '../hooks/useCourseDetailActions'
import { useCourseDiscussionActions } from '../hooks/useCourseDiscussionActions'
import CourseLearningSection from './CourseLearningSection'
import CourseDiscussionSection from './CourseDiscussionSection'
import CourseManageSection from './CourseManageSection'

type CourseDetailWorkspaceProps = {
  dashboard: EducationDashboardResponse
  view: 'full' | 'discussion' | 'manage'
  courseId?: string
  focusLessonId?: string
  onOpenLessonDiscussion: (courseId: string, lessonId: string) => void
}

export default function CourseDetailWorkspace({
  dashboard,
  view,
  courseId,
  focusLessonId,
  onOpenLessonDiscussion,
}: CourseDetailWorkspaceProps) {
  const {
    createDiscussionTopic,
    createPlatformReport,
    deleteDiscussionReply,
    deleteDiscussionTopic,
    enroll,
    moderateDiscussionReply,
    moderateDiscussionTopic,
    replyDiscussionTopic,
    saveCourse,
    submitCourseReview,
    updateCourseStatus,
    updateDiscussionReply,
    updateDiscussionTopic,
    updateLessonProgress,
    toggleDiscussionReaction,
  } = useEducationDashboard()
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)
  useAutoClearNotice(notice, setNotice)

  const model = useCourseDetailWorkspaceModel(dashboard, view, courseId)
  const {
    course,
    canManage,
    currentSection,
    secondaryNav,
  } = model

  const courseActions = useCourseDetailActions({
    course,
    dashboardActions: {
      enroll,
      saveCourse,
      submitCourseReview,
      updateCourseStatus,
      updateLessonProgress,
    },
    setNotice,
    setReviewSubmitting,
  })
  const discussionActions = useCourseDiscussionActions({
    course,
    focusLessonId,
    actions: {
      createDiscussionTopic,
      createPlatformReport,
      deleteDiscussionReply,
      deleteDiscussionTopic,
      moderateDiscussionReply,
      moderateDiscussionTopic,
      replyDiscussionTopic,
      toggleDiscussionReaction,
      updateDiscussionReply,
      updateDiscussionTopic,
    },
    setNotice,
  })

  if (!course) {
    return (
      <EducationShell eyebrow="课程工作区" title="课程详情" description="当前没有可查看的课程。">
        <EmptyStateCard
          title="当前没有可查看的课程"
          message="请先创建课程，或者等待课程审核通过后，再进入单课程工作区。"
        />
      </EducationShell>
    )
  }

  if (!canStudentViewCourse(course, dashboard, canManage)) {
    return (
      <EducationShell eyebrow="课程工作区" title="课程详情" description="学生只能进入已发布课程的学习区。">
        <PermissionStateCard title="课程暂不可查看" message="这门课程尚未发布或已经下架，暂时不能在学生端查看。" />
      </EducationShell>
    )
  }

  return (
    <EducationShell
      eyebrow="课程工作区"
      title={zh(course.title)}
      description={getCourseDetailDescription(dashboard.currentUser.role, currentSection)}
      secondaryNav={secondaryNav}
    >
      <div className="space-y-6">
        <InlineNotice notice={notice} />

        {currentSection === 'learn' ? (
          <CourseLearningSection
            dashboard={dashboard}
            model={model}
            courseActions={courseActions}
            discussionActions={discussionActions}
            focusLessonId={focusLessonId}
            reviewSubmitting={reviewSubmitting}
            onOpenLessonDiscussion={onOpenLessonDiscussion}
          />
        ) : null}

        {currentSection === 'discussion' ? (
          <CourseDiscussionSection
            dashboard={dashboard}
            model={model}
            discussionActions={discussionActions}
            focusLessonId={focusLessonId}
          />
        ) : null}

        {currentSection === 'manage' ? (
          <CourseManageSection dashboard={dashboard} model={model} courseActions={courseActions} />
        ) : null}
      </div>
    </EducationShell>
  )
}
