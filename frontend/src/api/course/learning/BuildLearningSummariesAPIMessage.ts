// 文件说明：前端学习接口封装，用于发起构建学习Summaries请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'

export type BuildLearningSummariesPayload = {
  courses: Course[]
  assignments: Assignment[]
  quizzes: Quiz[]
}

export type LearningSummariesResponse = {
  courseProgress: CourseProgressStats[]
  gradebook: GradebookEntry[]
}

export function createBuildLearningSummariesRequest(
  payload: BuildLearningSummariesPayload,
): ApiRequest<BuildLearningSummariesPayload, LearningSummariesResponse> {
  return {
    name: 'BuildLearningSummariesAPIMessage',
    method: 'POST',
    path: '/api/BuildLearningSummariesAPIMessage',
    payload,
  }
}
