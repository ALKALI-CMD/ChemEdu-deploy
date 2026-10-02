// 文件说明：定义管理端用户变更接口响应类型，用于前后端 API 返回值约束。
import type { UserProfile } from '@/objects/auth/UserProfile'

export type UserMutationResponse = {
  message: string
  user: UserProfile
}
