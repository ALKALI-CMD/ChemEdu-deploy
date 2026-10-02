import { Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui/UiComponents'

type AuthPasswordFieldProps = {
  id: string
  label: string
  value: string
  showPassword: boolean
  autoComplete: string
  error?: string
  onChange: (value: string) => void
  onToggleVisibility?: () => void
}

export default function AuthPasswordField({
  id,
  label,
  value,
  showPassword,
  autoComplete,
  error,
  onChange,
  onToggleVisibility,
}: AuthPasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-700" htmlFor={id}>
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
        />
        {onToggleVisibility ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-lg"
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
            onClick={onToggleVisibility}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
