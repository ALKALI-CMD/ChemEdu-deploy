// 文件说明：定义认证认证接口响应类型，用于前后端 API 返回值约束。
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type AuthSessionResponse = {
  sessionToken: SessionToken
  user: UserProfile
  expiresAt: string
}
