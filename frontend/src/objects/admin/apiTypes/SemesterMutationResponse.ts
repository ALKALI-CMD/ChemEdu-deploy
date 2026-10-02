// 文件说明：定义管理端学期变更接口响应类型，用于前后端 API 返回值约束。
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'

export type SemesterMutationResponse = {
  message: string
  semester: SemesterTerm
}
