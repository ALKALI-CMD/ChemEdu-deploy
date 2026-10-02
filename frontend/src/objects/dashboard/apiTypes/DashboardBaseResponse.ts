// 文件说明：定义看板看板基础数据接口响应类型，用于前后端 API 返回值约束。
import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseRecommendation } from '@/objects/course/catalog/CourseRecommendation'
import type { LearningPathRecommendation } from '@/objects/course/catalog/LearningPathRecommendation'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { NotificationItem } from '@/objects/course/discussion/NotificationItem'
import type { NotificationSetting } from '@/objects/course/discussion/NotificationSetting'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import type { CourseEnrollment } from '@/objects/course/enrollment/CourseEnrollment'
import type { WaitlistEntry } from '@/objects/course/enrollment/WaitlistEntry'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'
import type { TeacherTask } from '@/objects/dashboard/TeacherTask'

export type DashboardBaseResponse = {
  currentUser: UserProfile
  users: UserProfile[]
  departments: Department[]
  majors: Major[]
  academicClasses: AcademicClass[]
  semesters: SemesterTerm[]
  courses: Course[]
  courseReviews: CourseReview[]
  discussions: DiscussionTopic[]
  reports: PlatformReport[]
  recommendations: CourseRecommendation[]
  learningPaths: LearningPathRecommendation[]
  teacherTasks: TeacherTask[]
  enrollments: CourseEnrollment[]
  waitlistEntries: WaitlistEntry[]
  notifications: NotificationItem[]
  notificationSettings: NotificationSetting[]
}
