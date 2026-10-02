// 文件说明：前端课程目录接口封装，用于发起查找课程ById请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'

export type FindCourseByIdPayload = {
  courseId: string
  currentUser: UserProfile
}

export function createFindCourseByIdRequest(
  courseId: string,
  currentUser: UserProfile,
): ApiRequest<FindCourseByIdPayload, Course | null> {
  return {
    name: 'FindCourseByIdAPIMessage',
    method: 'POST',
    path: '/api/FindCourseByIdAPIMessage',
    payload: { courseId, currentUser },
  }
}
