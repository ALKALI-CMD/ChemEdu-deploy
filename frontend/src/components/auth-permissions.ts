import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'
import type { UserProfile } from '@/objects/auth/UserProfile'

const bannedPermission = 'user:banned'

export function isBannedUser(user?: Pick<UserProfile, 'permissions'> | null): boolean {
  return Boolean(user?.permissions?.some((permission) => String(permission) === bannedPermission))
}

export function isBannedSession(session?: AuthSessionResponse | null): boolean {
  return isBannedUser(session?.user)
}
