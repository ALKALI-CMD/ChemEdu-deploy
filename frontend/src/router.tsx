/* eslint-disable react-refresh/only-export-components -- Router configuration owns lazy route components, not a refresh boundary. */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import RoleGuard from '@/components/RoleGuard'
import { UserRole } from '@/objects/auth/UserRole'
const AdminConsole = lazy(() => import('@/pages/AdminConsole/AdminConsolePage'))
const AnalystCenterPage = lazy(() => import('@/pages/AnalystCenter/AnalystCenterPage'))
const AssistantCenter = lazy(() => import('@/pages/AssistantCenter/AssistantCenterPage'))
const BannedPage = lazy(() => import('@/pages/BannedPage/BannedPage'))
const CourseDetail = lazy(() => import('@/pages/CourseDetail/CourseDetailPage'))
const CourseDiscovery = lazy(() => import('@/pages/CourseDiscovery/CourseDiscoveryPage'))
const EducationHome = lazy(() => import('@/pages/EducationHome/EducationHomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage'))
const NotificationCenter = lazy(() => import('@/pages/NotificationCenter/NotificationCenterPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage/ProfilePage'))
const SearchCenter = lazy(() => import('@/pages/SearchCenter/SearchCenterPage'))
const StudentCenter = lazy(() => import('@/pages/StudentCenter/StudentCenterPage'))
const TeacherWorkbench = lazy(() => import('@/pages/TeacherWorkbench/TeacherWorkbenchPage'))
const OfficialHomePage = lazy(() => import('@/pages/official/OfficialHomePage'))
const ProgramsPage = lazy(() => import('@/pages/official/ProgramsPage'))
const FacultyPage = lazy(() => import('@/pages/official/FacultyPage'))
const ResearchPage = lazy(() => import('@/pages/official/ResearchPage'))
const ResultsPage = lazy(() => import('@/pages/official/ResultsPage'))
const LegalPage = lazy(() => import('@/pages/official/LegalPage'))
const EnrollPage = lazy(() => import('@/pages/official/EnrollPage'))

const allPlatformRoles = [
  UserRole.Student,
  UserRole.Teacher,
  UserRole.Assistant,
  UserRole.Analyst,
  UserRole.Admin,
]

const routes = [
  { path: '/legal', element: <LegalPage /> },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/banned',
    element: <BannedPage />,
  },
  {
    path: '/',
    element: <OfficialHomePage />,
  },
  {
    path: '/programs',
    element: <ProgramsPage />,
  },
  {
    path: '/faculty',
    element: <FacultyPage />,
  },
  {
    path: '/research',
    element: <ResearchPage />,
  },
  {
    path: '/results',
    element: <ResultsPage />,
  },
  {
    path: '/enroll',
    element: <EnrollPage />,
  },
  {
    path: '/discover',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <EducationHome />
      </RoleGuard>
    ),
  },
  {
    path: '/courses',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <CourseDiscovery />
      </RoleGuard>
    ),
  },
  {
    path: '/notifications',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <NotificationCenter />
      </RoleGuard>
    ),
  },
  {
    path: '/search',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <SearchCenter />
      </RoleGuard>
    ),
  },
  {
    path: '/assistant',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <AssistantCenter />
      </RoleGuard>
    ),
  },
  {
    path: '/student',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="overview" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/courses',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="courses" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/assignments',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="assignments" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/assignments/:assignmentId',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="assignments" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/quizzes',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="quizzes" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/quizzes/:quizId',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="quizzes" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/exams',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="exams" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/exams/:examId',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="exams" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/wrongbook',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="wrongbook" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/grades',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="grades" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/orders',
    element: (
      <RoleGuard allow={[UserRole.Student, UserRole.Admin]}>
        <StudentCenter section="orders" />
      </RoleGuard>
    ),
  },
  {
    path: '/student/tasks',
    element: <Navigate replace to="/student/assignments" />,
  },
  {
    path: '/teacher',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="overview" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/exams',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="exams" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/grading',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="grading" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/courses',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="courses" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/courses/:courseId',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="courses" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/publishing',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="publishing" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/reviews',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="reviews" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/reviews/:assignmentId',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="reviews" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/gradebook',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="gradebook" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/gradebook/course/:courseId',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="gradebook" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/gradebook/quiz/:quizId',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="gradebook" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/discussions',
    element: (
      <RoleGuard allow={[UserRole.Teacher, UserRole.Assistant, UserRole.Admin]}>
        <TeacherWorkbench section="discussions" />
      </RoleGuard>
    ),
  },
  {
    path: '/teacher/assignments',
    element: <Navigate replace to="/teacher/publishing" />,
  },
  {
    path: '/teacher/results',
    element: <Navigate replace to="/teacher/reviews" />,
  },
  {
    path: '/admin',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="overview" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/audits',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="audits" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/audits/:courseId',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="audits" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="users" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/users/:userId',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="users" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/governance',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="governance" governanceView="overview" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/governance/reports',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="governance" governanceView="reports" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/governance/discussions',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="governance" governanceView="discussions" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/governance/discussions/:discussionId',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="governance" governanceView="discussionDetail" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/governance/:discussionId',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="governance" governanceView="discussionDetail" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="overview" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization/enrollments',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="enrollments" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization/waitlist',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="waitlist" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization/structure',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="structure" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization/students',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="students" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization/courses',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="courses" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/organization/logs',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="organization" organizationView="logs" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/business',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="business" />
      </RoleGuard>
    ),
  },
  {
    path: '/admin/system',
    element: (
      <RoleGuard allow={[UserRole.Admin]}>
        <AdminConsole section="system" />
      </RoleGuard>
    ),
  },
  {
    path: '/analyst',
    element: (
      <RoleGuard allow={[UserRole.Analyst, UserRole.Teacher, UserRole.Admin]}>
        <AnalystCenterPage />
      </RoleGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <ProfilePage />
      </RoleGuard>
    ),
  },
  {
    path: '/course/:id/discussions',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <CourseDetail view="discussion" />
      </RoleGuard>
    ),
  },
  {
    path: '/course/:id/manage',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <CourseDetail view="manage" />
      </RoleGuard>
    ),
  },
  {
    path: '/course/:id',
    element: (
      <RoleGuard allow={allPlatformRoles}>
        <CourseDetail />
      </RoleGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate replace to="/discover" />,
  },
]

export const router = createBrowserRouter(routes.map((route) => ({
  ...route,
  element: <Suspense fallback={<div role="status" className="route-loading"><span className="loading-orbit" />正在加载页面…</div>}>{route.element}</Suspense>,
})))
