// 文件说明：定义课程评价课程评价/批改变更接口响应类型，用于前后端 API 返回值约束。
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'

export type CourseReviewMutationResponse = {
  message: string
  review: CourseReview
}
