// 文件说明：定义看板Education看板接口响应类型，用于前后端 API 返回值约束。
import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { AnalyticsSnapshot } from '@/objects/admin/AnalyticsSnapshot'
import type { AuditTrailEntry } from '@/objects/admin/AuditTrailEntry'
import type { BusinessDashboardSnapshot } from '@/objects/admin/BusinessDashboardSnapshot'
import type { Coupon } from '@/objects/admin/Coupon'
import type { Department } from '@/objects/admin/Department'
import type { DeploymentConfigSummary } from '@/objects/admin/DeploymentConfigSummary'
import type { Invoice } from '@/objects/admin/Invoice'
import type { Major } from '@/objects/admin/Major'
import type { ObservabilitySnapshot } from '@/objects/admin/ObservabilitySnapshot'
import type { Order } from '@/objects/admin/Order'
import type { OrganizationChangeLog } from '@/objects/admin/OrganizationChangeLog'
import type { PermissionMatrixEntry } from '@/objects/admin/PermissionMatrixEntry'
import type { Promotion } from '@/objects/admin/Promotion'
import type { Refund } from '@/objects/admin/Refund'
import type { ResourcePermissionGrant } from '@/objects/admin/ResourcePermissionGrant'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { TestStrategyItem } from '@/objects/admin/TestStrategyItem'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseRecommendation } from '@/objects/course/catalog/CourseRecommendation'
import type { LearningPathRecommendation } from '@/objects/course/catalog/LearningPathRecommendation'
import type { ResourceAsset } from '@/objects/course/catalog/ResourceAsset'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { MessageThread } from '@/objects/course/discussion/MessageThread'
import type { NotificationItem } from '@/objects/course/discussion/NotificationItem'
import type { NotificationSetting } from '@/objects/course/discussion/NotificationSetting'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import type { CourseEnrollment } from '@/objects/course/enrollment/CourseEnrollment'
import type { WaitlistEntry } from '@/objects/course/enrollment/WaitlistEntry'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'
import type { TeacherTask } from '@/objects/dashboard/TeacherTask'
import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'

export type EducationDashboardResponse = {
  currentUser: UserProfile
  users: UserProfile[]
  departments: Department[]
  majors: Major[]
  academicClasses: AcademicClass[]
  semesters: SemesterTerm[]
  courses: Course[]
  courseReviews: CourseReview[]
  assignments: Assignment[]
  quizzes: Quiz[]
  discussions: DiscussionTopic[]
  reports: PlatformReport[]
  messages: MessageThread[]
  orders: Order[]
  coupons: Coupon[]
  promotions: Promotion[]
  invoices: Invoice[]
  refunds: Refund[]
  resourceAssets: ResourceAsset[]
  recommendations: CourseRecommendation[]
  learningPaths: LearningPathRecommendation[]
  teacherTasks: TeacherTask[]
  enrollments: CourseEnrollment[]
  waitlistEntries: WaitlistEntry[]
  organizationChangeLogs: OrganizationChangeLog[]
  notifications: NotificationItem[]
  notificationSettings: NotificationSetting[]
  analytics: AnalyticsSnapshot
  businessDashboard: BusinessDashboardSnapshot
  permissionMatrix: PermissionMatrixEntry[]
  resourcePermissionGrants: ResourcePermissionGrant[]
  auditTrail: AuditTrailEntry[]
  testStrategy: TestStrategyItem[]
  observability: ObservabilitySnapshot
  deploymentConfig: DeploymentConfigSummary
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
  teachingInsights: TeachingInsightSnapshot
}
