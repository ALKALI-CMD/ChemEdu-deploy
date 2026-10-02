// 文件说明：定义课程目录课程领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'
import type { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import type { CourseModule } from '@/objects/course/catalog/CourseModule'
import type { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { EnrollmentPolicy } from '@/objects/course/catalog/EnrollmentPolicy'

export type Course = {
  id: string
  title: string
  subtitle: string
  category: string
  grade: string
  schedule: string
  lessonsCount: number
  price: number
  rating: number
  completionRate: number
  enrolledCount: number
  status: CourseStatus
  auditStatus: CourseAuditStatus
  auditComment?: string
  auditedBy?: string
  auditedAt?: string
  teacherId: UserId
  assistants: UserId[]
  semesterLabel?: string
  offeringCode?: string
  startsAt?: string
  endsAt?: string
  academicClassIds: string[]
  capacity: number
  enrollmentPolicy: EnrollmentPolicy
  tags: string[]
  description: string
  coverImageUrl?: string
  modules: CourseModule[]
}
