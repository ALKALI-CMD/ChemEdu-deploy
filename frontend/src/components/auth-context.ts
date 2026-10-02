import { createContext, useContext } from 'react'
import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'
import type { UserProfile } from '@/objects/auth/UserProfile'
import { UserRole } from '@/objects/auth/UserRole'

export type RegisterInput = {
  name: string
  email: string
  password: string
  role: UserRole
  age?: number
  grade?: string
  subject?: string
  bio: string
}

export type SessionClearReason = 'manual' | 'expired'

export type AuthContextValue = {
  session: AuthSessionResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  clearSession: (reason?: SessionClearReason) => void
  updateSessionUser: (user: UserProfile) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用。')
  }

  return context
}
