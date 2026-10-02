// 文件说明：定义看板Education看板接口响应类型，用于前后端 API 返回值约束。
package microservices.dashboard.objects.apiTypes

import microservices.dashboard.objects.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.objects.*
import microservices.auth.objects.UserProfile
import microservices.course.catalog.objects.{Course, CourseRecommendation, LearningPathRecommendation, ResourceAsset}
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.CourseReview

final case class EducationDashboardResponse(
  currentUser: UserProfile,
  users: List[UserProfile],
  departments: List[Department],
  majors: List[Major],
  academicClasses: List[AcademicClass],
  semesters: List[SemesterTerm],
  courses: List[Course],
  courseReviews: List[CourseReview],
  assignments: List[Assignment],
  quizzes: List[Quiz],
  discussions: List[DiscussionTopic],
  reports: List[PlatformReport],
  messages: List[MessageThread],
  orders: List[Order],
  coupons: List[Coupon],
  promotions: List[Promotion],
  invoices: List[Invoice],
  refunds: List[Refund],
  resourceAssets: List[ResourceAsset],
  recommendations: List[CourseRecommendation],
  learningPaths: List[LearningPathRecommendation],
  teacherTasks: List[TeacherTask],
  enrollments: List[CourseEnrollment],
  waitlistEntries: List[WaitlistEntry],
  organizationChangeLogs: List[OrganizationChangeLog],
  notifications: List[NotificationItem],
  notificationSettings: List[NotificationSetting],
  analytics: AnalyticsSnapshot,
  businessDashboard: BusinessDashboardSnapshot,
  permissionMatrix: List[PermissionMatrixEntry],
  resourcePermissionGrants: List[ResourcePermissionGrant],
  auditTrail: List[AuditTrailEntry],
  testStrategy: List[TestStrategyItem],
  observability: ObservabilitySnapshot,
  deploymentConfig: DeploymentConfigSummary,
  gradebook: List[GradebookEntry],
  courseProgress: List[CourseProgressStats],
  teachingInsights: TeachingInsightSnapshot
)

object EducationDashboardResponse:
  given Encoder[EducationDashboardResponse] = deriveEncoder[EducationDashboardResponse]
  given Decoder[EducationDashboardResponse] = deriveDecoder[EducationDashboardResponse]
