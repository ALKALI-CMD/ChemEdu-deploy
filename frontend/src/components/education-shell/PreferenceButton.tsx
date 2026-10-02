import { useEffect, useState } from 'react'
import { Check, Settings } from 'lucide-react'
import { Button, Switch } from '@/components/ui/UiComponents'

type ThemeMode = 'light' | 'dark'
type AccentMode = 'teal' | 'blue' | 'amber' | 'rose'
type FontScale = 'normal' | 'large'

const preferenceStorageKey = 'education-ui-preferences'

type UiPreferences = {
  theme: ThemeMode
  accent: AccentMode
  fontScale: FontScale
  compact: boolean
}

const defaultPreferences: UiPreferences = {
  theme: 'light',
  accent: 'teal',
  fontScale: 'normal',
  compact: false,
}

const accentOptions: Array<{ value: AccentMode; label: string; swatch: string }> = [
  { value: 'teal', label: '青绿', swatch: 'bg-teal-600' },
  { value: 'blue', label: '蓝色', swatch: 'bg-sky-600' },
  { value: 'amber', label: '暖橙', swatch: 'bg-amber-600' },
  { value: 'rose', label: '玫红', swatch: 'bg-rose-600' },
]

function readPreferences(): UiPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(preferenceStorageKey) ?? '{}') as Partial<UiPreferences>
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      accent: ['teal', 'blue', 'amber', 'rose'].includes(String(parsed.accent)) ? parsed.accent as AccentMode : 'teal',
      fontScale: parsed.fontScale === 'large' ? 'large' : 'normal',
      compact: Boolean(parsed.compact),
    }
  } catch {
    return defaultPreferences
  }
}

function applyPreferences(preferences: UiPreferences) {
  document.documentElement.classList.toggle('theme-dark', preferences.theme === 'dark')
  document.documentElement.classList.toggle('theme-compact', preferences.compact)
  document.documentElement.classList.toggle('theme-large-text', preferences.fontScale === 'large')
  document.documentElement.classList.remove('theme-accent-teal', 'theme-accent-blue', 'theme-accent-amber', 'theme-accent-rose')
  document.documentElement.classList.add(`theme-accent-${preferences.accent}`)
  document.documentElement.style.colorScheme = preferences.theme
}

export default function PreferenceButton() {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<UiPreferences>(() => readPreferences())

  useEffect(() => {
    applyPreferences(preferences)
    window.localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences))
  }, [preferences])

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="打开界面设置"
        className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
        onClick={() => setOpen((current) => !current)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {open ? (
        <div className="absolute left-0 top-11 z-20 w-80 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
          <div>
            <p className="font-semibold text-slate-950">界面设置</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">调整显示偏好。</p>
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
              <span className="text-sm text-slate-700">深色模式</span>
              <Switch
                checked={preferences.theme === 'dark'}
                onCheckedChange={(checked) => setPreferences((current) => ({ ...current, theme: checked ? 'dark' : 'light' }))}
              />
            </label>
            <div className="rounded-lg border border-slate-200 px-3 py-3">
              <p className="text-sm font-medium text-slate-700">主题色</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {accentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                      preferences.accent === option.value
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setPreferences((current) => ({ ...current, accent: option.value }))}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${option.swatch}`} />
                      {option.label}
                    </span>
                    {preferences.accent === option.value ? <Check className="h-4 w-4" /> : null}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
              <span className="text-sm text-slate-700">大字号</span>
              <Switch
                checked={preferences.fontScale === 'large'}
                onCheckedChange={(checked) => setPreferences((current) => ({ ...current, fontScale: checked ? 'large' : 'normal' }))}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
              <span className="text-sm text-slate-700">紧凑显示</span>
              <Switch
                checked={preferences.compact}
                onCheckedChange={(checked) => setPreferences((current) => ({ ...current, compact: checked }))}
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  )
}
