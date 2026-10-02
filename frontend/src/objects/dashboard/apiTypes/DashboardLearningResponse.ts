// 文件说明：定义看板看板学习接口响应类型，用于前后端 API 返回值约束。
import type { AnalyticsSnapshot } from '@/objects/admin/AnalyticsSnapshot'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'

export type DashboardLearningResponse = {
  assignments: Assignment[]
  quizzes: Quiz[]
  analytics: AnalyticsSnapshot
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
}
