// 文件说明：定义管理端院系变更接口响应类型，用于前后端 API 返回值约束。
import type { Department } from '@/objects/admin/Department'

export type DepartmentMutationResponse = {
  message: string
  department: Department
}
