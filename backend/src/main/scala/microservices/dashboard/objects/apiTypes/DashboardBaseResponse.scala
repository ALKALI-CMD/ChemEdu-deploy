// 文件说明：定义看板看板基础数据接口响应类型，用于前后端 API 返回值约束。
package microservices.dashboard.objects.apiTypes

import microservices.dashboard.objects.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.objects.{AcademicClass, Department, Major, SemesterTerm}
import microservices.auth.objects.UserProfile
import microservices.course.catalog.objects.{Course, CourseRecommendation, LearningPathRecommendation}
import microservices.course.discussion.objects.{DiscussionTopic, NotificationItem, NotificationSetting, PlatformReport}
import microservices.course.enrollment.objects.{CourseEnrollment, WaitlistEntry}
import microservices.course.review.objects.CourseReview

final case class DashboardBaseResponse(
  currentUser: UserProfile,
  users: List[UserProfile],
  departments: List[Department],
  majors: List[Major],
  academicClasses: List[AcademicClass],
  semesters: List[SemesterTerm],
  courses: List[Course],
  courseReviews: List[CourseReview],
  discussions: List[DiscussionTopic],
  reports: List[PlatformReport],
  recommendations: List[CourseRecommendation],
  learningPaths: List[LearningPathRecommendation],
  teacherTasks: List[TeacherTask],
  enrollments: List[CourseEnrollment],
  waitlistEntries: List[WaitlistEntry],
  notifications: List[NotificationItem],
  notificationSettings: List[NotificationSetting]
)

object DashboardBaseResponse:
  given Encoder[DashboardBaseResponse] = deriveEncoder[DashboardBaseResponse]
  given Decoder[DashboardBaseResponse] = deriveDecoder[DashboardBaseResponse]
