// 文件说明：定义管理端课程审核变更接口响应类型，用于前后端 API 返回值约束。
import type { Course } from '@/objects/course/catalog/Course'

export type CourseAuditMutationResponse = {
  message: string
  course: Course
}
