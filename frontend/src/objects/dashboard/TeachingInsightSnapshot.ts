// 文件说明：定义看板教学洞察Snapshot领域数据类型，用于业务流程和接口传输。
import type { AtRiskStudent } from '@/objects/dashboard/AtRiskStudent'
import type { ClassGradeDistribution } from '@/objects/dashboard/ClassGradeDistribution'
import type { CourseCompletionDistribution } from '@/objects/dashboard/CourseCompletionDistribution'
import type { CourseGradeDistribution } from '@/objects/dashboard/CourseGradeDistribution'
import type { LessonBottleneck } from '@/objects/dashboard/LessonBottleneck'
import type { QuestionHotspot } from '@/objects/dashboard/QuestionHotspot'

export type TeachingInsightSnapshot = {
  atRiskStudents: AtRiskStudent[]
  questionHotspots: QuestionHotspot[]
  lessonBottlenecks: LessonBottleneck[]
  completionDistributions: CourseCompletionDistribution[]
  courseGradeDistributions: CourseGradeDistribution[]
  classGradeDistributions: ClassGradeDistribution[]
  interventionQueueCount: number
}
