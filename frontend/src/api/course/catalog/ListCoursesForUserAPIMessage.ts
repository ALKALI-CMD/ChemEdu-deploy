// 文件说明：前端课程目录接口封装，用于发起列表查询CoursesFor用户请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'

export type ListCoursesForUserPayload = {
  currentUser: UserProfile
}

export function createListCoursesForUserRequest(
  currentUser: UserProfile,
): ApiRequest<ListCoursesForUserPayload, Course[]> {
  return {
    name: 'ListCoursesForUserAPIMessage',
    method: 'POST',
    path: '/api/ListCoursesForUserAPIMessage',
    payload: { currentUser },
  }
}
