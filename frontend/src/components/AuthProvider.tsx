import { useEffect, useMemo, useState } from 'react'
import { sendAPI } from '@/lib/apiClient'
import { createLoginRequest } from '@/api/auth/LoginAPIMessage'
import { createLogoutRequest } from '@/api/auth/LogoutAPIMessage'
import { createRegisterRequest } from '@/api/auth/RegisterAPIMessage'
import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'
import type { UserProfile } from '@/objects/auth/UserProfile'
import { AuthContext, type AuthContextValue, type RegisterInput, type SessionClearReason } from '@/components/auth-context'
import { isSessionExpired, persistExpiryNotice, storageKey } from '@/components/auth-session'

function isValidSession(value: AuthSessionResponse | null): value is AuthSessionResponse {
  return Boolean(value?.sessionToken && value.user?.role && value.expiresAt)
}

function isValidUser(value: UserProfile | null | undefined): value is UserProfile {
  return Boolean(value?.id && value.role)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSessionResponse | null>(null)
  const [loading, setLoading] = useState(true)

  function persistSession(nextSession: AuthSessionResponse | null, reason: SessionClearReason = 'manual') {
    setSession(nextSession)
    if (nextSession) {
      window.localStorage.setItem(storageKey, JSON.stringify(nextSession))
    } else {
      persistExpiryNotice(reason)
      window.localStorage.removeItem(storageKey)
    }
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        let persistedSession: AuthSessionResponse | null = null
        try {
          persistedSession = JSON.parse(raw) as AuthSessionResponse
        } catch {
          window.localStorage.removeItem(storageKey)
          persistExpiryNotice('manual')
        }

        if (persistedSession && !isValidSession(persistedSession)) {
          window.localStorage.removeItem(storageKey)
          persistExpiryNotice('manual')
        } else if (persistedSession && isSessionExpired(persistedSession)) {
          window.localStorage.removeItem(storageKey)
          persistExpiryNotice('expired')
        } else if (persistedSession) {
          setSession(persistedSession)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !Number.isFinite(Date.parse(session.expiresAt))) {
      return
    }

    const timeoutMs = Date.parse(session.expiresAt) - Date.now()
    if (timeoutMs <= 0) {
      persistSession(null, 'expired')
      return
    }

    const timer = window.setTimeout(() => {
      persistSession(null, 'expired')
    }, timeoutMs)

    return () => window.clearTimeout(timer)
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async login(email: string, password: string) {
        const nextSession = await sendAPI(createLoginRequest({ email: email.trim().toLowerCase(), password }))
        persistSession(nextSession)
      },
      async register(input: RegisterInput) {
        const nextSession = await sendAPI(
          createRegisterRequest({
            ...input,
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            grade: input.grade?.trim(),
            subject: input.subject?.trim(),
            bio: input.bio.trim(),
          }),
        )
        persistSession(nextSession)
      },
      async logout() {
        if (session) {
          try {
            await sendAPI(createLogoutRequest(session.sessionToken))
          } catch {
            // Even if the backend session is already gone, we still clear the local login state.
          }
        }
        persistSession(null)
      },
      clearSession(reason = 'manual') {
        persistSession(null, reason)
      },
      updateSessionUser(user) {
        if (!isValidUser(user)) {
          return
        }
        setSession((current) => {
          if (!current) {
            return current
          }
          const nextSession = { ...current, user }
          window.localStorage.setItem(storageKey, JSON.stringify(nextSession))
          return nextSession
        })
      },
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
