import EducationShell from '@/components/EducationShell'
import { InlineNotice, useAutoClearNotice } from '@/components/ExperienceState'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

import { useStudentCenterActions } from '../hooks/useStudentCenterActions'
import { useStudentCenterModel, type StudentSection } from '../hooks/useStudentCenterModel'
import { sectionCopy } from '../objects/studentCenterConfig'
import AssignmentPanel from './panels/AssignmentPanel/AssignmentPanel'
import EnrolledCoursesPanel from './panels/CoursesPanel/CoursesPanel'
import ExamPanel from './panels/ExamPanel/ExamPanel'
import ExamResultPanel from './panels/ExamResultPanel/ExamResultPanel'
import GradeDetailsPanel from './panels/GradeDetailsPanel/GradeDetailsPanel'
import StudentOverviewWorkspace from './panels/OverviewPanel/StudentOverviewWorkspace'
import StudentOrdersPanel from './panels/OrdersPanel/OrdersPanel'
import QuizPanel from './panels/QuizPanel/QuizPanel'
import WrongBookPanel from './panels/WrongBookPanel/WrongBookPanel'

type StudentCenterWorkspaceProps = {
  dashboard: EducationDashboardResponse
  section: StudentSection
  focusAssignmentId?: string
  focusQuizId?: string
  focusExamId?: string
  focusQuestionId?: string
}

export default function StudentCenterWorkspace({
  dashboard,
  section,
  focusAssignmentId,
  focusQuizId,
  focusExamId,
  focusQuestionId,
}: StudentCenterWorkspaceProps) {
  const actions = useEducationDashboard()
  const model = useStudentCenterModel(dashboard)
  const state = useStudentCenterActions(actions, model.studentQuizzes)
  useAutoClearNotice(state.notice, state.setNotice)

  return (
    <EducationShell
      eyebrow="清北营 · 学生中心"
      title={sectionCopy[section].title}
      description={sectionCopy[section].description}
      navCounts={model.navCounts}
    >
      <div className="space-y-6">
        <InlineNotice notice={state.notice} />

        {section === 'overview' ? (
          <StudentOverviewWorkspace
            enrolledCourses={model.enrolledCourses}
            recommendedCourses={model.recommendedCourses}
            assignments={model.studentAssignments}
            quizzes={model.studentQuizzes}
            continueLearning={model.continueLearning}
            gradebook={model.studentGradebook}
            courseProgress={model.studentCourseProgress}
            latestScores={model.latestScores}
            prioritizedAssignments={model.prioritizedAssignments}
            prioritizedQuizzes={model.prioritizedQuizzes}
            groupedTimeline={model.groupedTimeline}
            courseTitleMap={new Map(model.enrolledCourses.map((course) => [course.id, String(course.title)]))}
            teacherNameById={new Map(dashboard.users.map((user) => [String(user.id), String(user.name)]))}
          />
        ) : null}

        {section === 'courses' ? <EnrolledCoursesPanel courses={model.enrolledCourses} /> : null}

        {section === 'exams' ? focusExamId && focusExamId !== 'list' ? <ExamResultPanel /> : <ExamPanel /> : null}

        {section === 'assignments' ? (
          <AssignmentPanel
            assignments={model.prioritizedAssignments}
            focusAssignmentId={focusAssignmentId}
            assignmentDrafts={state.assignmentDrafts}
            attachmentDrafts={state.assignmentAttachmentDrafts}
            submittingKey={state.submittingKey}
            onDraftChange={(assignmentId, value) => state.setAssignmentDrafts((current) => ({ ...current, [assignmentId]: value }))}
            onAttachmentSelect={state.handleSelectAssignmentFiles}
            onAttachmentClear={(assignmentId) => state.setAssignmentAttachmentDrafts((current) => ({ ...current, [assignmentId]: [] }))}
            onSubmit={state.handleSubmitAssignment}
          />
        ) : null}

        {section === 'quizzes' ? (
          <QuizPanel
            quizzes={model.prioritizedQuizzes}
            focusQuizId={focusQuizId}
            focusQuestionId={focusQuestionId}
            objectiveDrafts={state.quizObjectiveDrafts}
            answerDrafts={state.quizAnswerDrafts}
            subjectiveDrafts={state.quizSubjectiveDrafts}
            submittingKey={state.submittingKey}
            onObjectiveChange={state.updateObjectiveAnswer}
            onAnswerChange={state.updateQuizAnswer}
            onSubjectiveChange={(quizId, value) => state.setQuizSubjectiveDrafts((current) => ({ ...current, [quizId]: value }))}
            onSubmit={state.handleSubmitQuiz}
          />
        ) : null}

        {section === 'wrongbook' ? <WrongBookPanel items={model.wrongQuestions} /> : null}

        {section === 'grades' ? (
          <GradeDetailsPanel
            gradebook={model.studentGradebook}
            courseProgress={model.studentCourseProgress}
            gradeDetails={model.gradeDetails}
            gradeTrend={model.gradeTrend}
          />
        ) : null}

        {section === 'orders' ? <StudentOrdersPanel orders={model.studentOrders} /> : null}
      </div>
    </EducationShell>
  )
}
