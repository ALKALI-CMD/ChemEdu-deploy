import { useCallback, useEffect, useMemo, useState } from 'react'
import { sendAPI } from '@/lib/apiClient'
import { createGetDashboardBaseRequest } from '@/api/dashboard/GetDashboardBaseAPIMessage'
import { createGetDashboardBusinessRequest } from '@/api/dashboard/GetDashboardBusinessAPIMessage'
import { createGetDashboardGovernanceRequest } from '@/api/dashboard/GetDashboardGovernanceAPIMessage'
import { createGetDashboardLearningRequest } from '@/api/dashboard/GetDashboardLearningAPIMessage'
import { createGetTeachingInsightsRequest } from '@/api/dashboard/GetTeachingInsightsAPIMessage'
import { useAuth } from '@/components/auth-context'
import { EducationDashboardContext, type EducationDashboardContextValue } from '@/components/education-dashboard-context'
import { useDashboardActions } from '@/components/useDashboardActions'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

async function loadEducationDashboard(sessionToken: SessionToken): Promise<EducationDashboardResponse> {
  const [base, learning, business, governance, teachingInsights] = await Promise.all([
    sendAPI(createGetDashboardBaseRequest(sessionToken)),
    sendAPI(createGetDashboardLearningRequest(sessionToken)),
    sendAPI(createGetDashboardBusinessRequest(sessionToken)),
    sendAPI(createGetDashboardGovernanceRequest(sessionToken)),
    sendAPI(createGetTeachingInsightsRequest(sessionToken)),
  ])

  return {
    ...base,
    ...learning,
    ...business,
    ...governance,
    teachingInsights,
  }
}

export function EducationDashboardProvider({ children }: { children: React.ReactNode }) {
  const { session, clearSession, updateSessionUser } = useAuth()
  const [dashboard, setDashboard] = useState<EducationDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async (options?: { silent?: boolean }) => {
    if (!session) {
      setDashboard(null)
      setError(null)
      setLoading(false)
      return
    }

    if (!options?.silent) {
      setLoading(true)
    }

    try {
      const nextDashboard = await loadEducationDashboard(session.sessionToken)
      setDashboard(nextDashboard)
      if (JSON.stringify(session.user) !== JSON.stringify(nextDashboard.currentUser)) {
        updateSessionUser(nextDashboard.currentUser)
      }
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard.'
      setError(message)
      if (
        message.includes('登录态已失效') ||
        message.includes('Invalid session token') ||
        message.includes('Invalid or expired session token') ||
        message.includes('Session has expired')
      ) {
        clearSession()
      }
    } finally {
      setLoading(false)
    }
  }, [clearSession, session, updateSessionUser])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (!session) return

    const refreshCurrentUser = () => {
      void loadDashboard({ silent: true })
    }
    const timer = window.setInterval(refreshCurrentUser, 8000)
    window.addEventListener('focus', refreshCurrentUser)
    document.addEventListener('visibilitychange', refreshCurrentUser)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshCurrentUser)
      document.removeEventListener('visibilitychange', refreshCurrentUser)
    }
  }, [loadDashboard, session])

  const actions = useDashboardActions({
    session,
    refreshDashboard: loadDashboard,
    updateSessionUser,
  })

  const value = useMemo<EducationDashboardContextValue>(
    () => ({
      dashboard,
      loading,
      error,
      refresh: loadDashboard,
      ...actions,
    }),
    [actions, dashboard, error, loadDashboard, loading],
  )

  return <EducationDashboardContext.Provider value={value}>{children}</EducationDashboardContext.Provider>
}
