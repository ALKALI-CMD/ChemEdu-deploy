import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'
import type { SessionClearReason } from '@/components/auth-context'

export const storageKey = 'education-auth-session'
const sessionExpiryFlagKey = 'education-auth-expired'
const manualLogoutFlagKey = 'education-auth-manual-logout'

export function isSessionExpired(session: AuthSessionResponse): boolean {
  return Number.isFinite(Date.parse(session.expiresAt)) && Date.parse(session.expiresAt) <= Date.now()
}

export function persistExpiryNotice(reason: SessionClearReason) {
  if (reason === 'expired') {
    window.sessionStorage.setItem(sessionExpiryFlagKey, '1')
    window.sessionStorage.removeItem(manualLogoutFlagKey)
  } else {
    window.sessionStorage.setItem(manualLogoutFlagKey, '1')
  }
}

export function consumeSessionExpiredFlag(): boolean {
  const raw = window.sessionStorage.getItem(sessionExpiryFlagKey)
  if (!raw) {
    return false
  }
  window.sessionStorage.removeItem(sessionExpiryFlagKey)
  return true
}

export function consumeManualLogoutFlag(): boolean {
  const raw = window.sessionStorage.getItem(manualLogoutFlagKey)
  if (!raw) {
    return false
  }
  window.sessionStorage.removeItem(manualLogoutFlagKey)
  return true
}
