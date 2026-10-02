// 文件说明：定义管理端专业变更接口响应类型，用于前后端 API 返回值约束。
import type { Major } from '@/objects/admin/Major'

export type MajorMutationResponse = {
  message: string
  major: Major
}
