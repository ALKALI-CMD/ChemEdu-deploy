const legacyWalletStorageKey = 'education-platform-wallet-balance'
const walletStorageKeyPrefix = 'education-platform-wallet-balance'

export const walletRechargeOptions = [50, 100, 200, 500] as const

function walletStorageKey(userId: string): string {
  return `${walletStorageKeyPrefix}:${userId}`
}

function normalizeBalance(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function readWalletBalance(userId: string): number {
  const key = walletStorageKey(userId)
  const existing = window.localStorage.getItem(key)
  if (existing !== null) {
    return normalizeBalance(Number(existing))
  }

  const legacyRaw = window.localStorage.getItem(legacyWalletStorageKey)
  const legacyValue = legacyRaw ? normalizeBalance(Number(legacyRaw)) : 0
  if (legacyValue > 0) {
    window.localStorage.setItem(key, String(legacyValue))
  }
  return legacyValue
}

export function writeWalletBalance(userId: string, balance: number): number {
  const nextBalance = normalizeBalance(balance)
  window.localStorage.setItem(walletStorageKey(userId), String(nextBalance))
  return nextBalance
}

export function rechargeWalletBalance(userId: string, currentBalance: number, amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return currentBalance
  }
  return writeWalletBalance(userId, currentBalance + amount)
}

export function deductWalletBalance(userId: string, currentBalance: number, amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return currentBalance
  }
  return writeWalletBalance(userId, Math.max(0, currentBalance - amount))
}

export function readLegacyWalletBalance(): number {
  const raw = window.localStorage.getItem(legacyWalletStorageKey)
  const value = raw ? Number(raw) : 0
  return normalizeBalance(value)
}
