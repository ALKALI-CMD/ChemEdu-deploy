import type { UserId } from '@/objects/auth/UserId'
import type { CourseModuleInput } from '@/objects/course/catalog/CourseModuleInput'
import type { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { EnrollmentPolicy } from '@/objects/course/catalog/EnrollmentPolicy'

export type CourseEditorInput = {
  courseId?: string
  title: string
  subtitle: string
  category: string
  grade: string
  schedule: string
  price: number
  rating: number
  completionRate: number
  status: CourseStatus
  teacherId?: UserId
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
  modules: CourseModuleInput[]
}
