import type { FormEvent } from 'react'
import { useState } from 'react'
import { KeyRound, UserPlus } from 'lucide-react'
import { UserRole } from '@/objects/auth/UserRole'
import { InlineNotice, type NoticeState } from '@/components/ExperienceState'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui/UiComponents'
import type { AuthFieldErrors, AuthMode } from '../functions/authPanelModel'
import AuthPasswordField from './AuthPasswordField'
import AuthRegisterFields from './AuthRegisterFields'

type AuthFormCardProps = {
  mode: AuthMode
  submitting: boolean
  notice: NoticeState
  fieldErrors: AuthFieldErrors
  email: string
  password: string
  confirmPassword: string
  name: string
  role: UserRole
  grade: string
  subject: string
  bio: string
  onToggleMode: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onNameChange: (value: string) => void
  onRoleChange: (value: UserRole) => void
  onGradeChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onBioChange: (value: string) => void
}

export default function AuthFormCard(props: AuthFormCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    mode,
    submitting,
    notice,
    fieldErrors,
    email,
    password,
    confirmPassword,
    name,
    role,
    grade,
    subject,
    bio,
    onToggleMode,
    onSubmit,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onNameChange,
    onRoleChange,
    onGradeChange,
    onSubjectChange,
    onBioChange,
  } = props

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-slate-950">
            {mode === 'login' ? <KeyRound className="h-5 w-5 text-sky-700" /> : <UserPlus className="h-5 w-5 text-sky-700" />}
            {mode === 'login' ? '账号登录' : '注册新账号'}
          </CardTitle>
        </div>
        <Button variant="outline" className="rounded-lg" onClick={onToggleMode}>
          {mode === 'login' ? '去注册' : '去登录'}
        </Button>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <InlineNotice notice={notice} />

          {mode === 'register' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="auth-name">
                用户名
              </label>
              <Input
                id="auth-name"
                value={name}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                onChange={(event) => onNameChange(event.target.value)}
              />
              {fieldErrors.name ? <p className="text-xs text-red-600">{fieldErrors.name}</p> : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" htmlFor="auth-email">
              邮箱
            </label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(event) => onEmailChange(event.target.value)}
            />
            {fieldErrors.email ? <p className="text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>

          <AuthPasswordField
            id="auth-password"
            label="密码"
            value={password}
            showPassword={showPassword}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            error={fieldErrors.password}
            onChange={onPasswordChange}
            onToggleVisibility={() => setShowPassword((current) => !current)}
          />

          {mode === 'register' ? (
            <AuthPasswordField
              id="auth-confirm-password"
              label="确认密码"
              value={confirmPassword}
              showPassword={showPassword}
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
              onChange={onConfirmPasswordChange}
            />
          ) : null}

          {mode === 'register' ? (
            <AuthRegisterFields
              role={role}
              grade={grade}
              subject={subject}
              bio={bio}
              fieldErrors={fieldErrors}
              onRoleChange={onRoleChange}
              onGradeChange={onGradeChange}
              onSubjectChange={onSubjectChange}
              onBioChange={onBioChange}
            />
          ) : null}

          <Button type="submit" className="w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800" disabled={submitting}>
            {submitting ? '提交中...' : mode === 'login' ? '登录并进入系统' : '注册并自动登录'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
