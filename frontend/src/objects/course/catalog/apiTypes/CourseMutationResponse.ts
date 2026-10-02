// 文件说明：定义课程目录课程变更接口响应类型，用于前后端 API 返回值约束。
import type { Course } from '@/objects/course/catalog/Course'

export type CourseMutationResponse = {
  message: string
  course: Course
}
