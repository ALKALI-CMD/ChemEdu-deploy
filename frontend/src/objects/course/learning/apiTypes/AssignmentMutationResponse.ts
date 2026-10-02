// 文件说明：定义学习作业变更接口响应类型，用于前后端 API 返回值约束。
import type { Assignment } from '@/objects/course/learning/Assignment'

export type AssignmentMutationResponse = {
  message: string
  assignment: Assignment
}
