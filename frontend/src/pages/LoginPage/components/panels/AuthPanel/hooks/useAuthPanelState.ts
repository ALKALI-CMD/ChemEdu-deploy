import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserRole } from '@/objects/auth/UserRole'
import { useAuth } from '@/components/auth-context'
import { consumeSessionExpiredFlag } from '@/components/auth-session'
import { type NoticeState, useAutoClearNotice } from '@/components/ExperienceState'
import {
  getDefaultRoleHint,
  getRoleHome,
  validateAuthForm,
  type AuthFieldErrors,
  type AuthMode,
} from '../functions/authPanelModel'

export function useAuthPanelState() {
  const { session, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.Student)
  const [grade, setGrade] = useState('大一')
  const [subject, setSubject] = useState('')
  const [bio, setBio] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})

  useAutoClearNotice(notice, setNotice)

  const routeState = (location.state as { from?: string; sessionExpired?: boolean } | null) ?? null
  useEffect(() => {
    if (routeState?.sessionExpired || consumeSessionExpiredFlag()) {
      setNotice({
        tone: 'error',
        title: '登录已过期',
        message: '为了保护账号安全，请重新登录后继续使用系统。',
      })
    }
  }, [routeState?.sessionExpired])

  function applyRegisterErrorToFields(message: string) {
    if (message.includes('email is already registered')) {
      setFieldErrors((current) => ({ ...current, email: '这个邮箱已经注册过了，请直接登录或更换邮箱。' }))
      return true
    }

    if (message.includes('username is already registered')) {
      setFieldErrors((current) => ({ ...current, name: '这个用户名已经被占用，请更换一个用户名。' }))
      return true
    }

    if (message.includes('Password must be at least 8 characters')) {
      setFieldErrors((current) => ({ ...current, password: '密码至少 8 位，且必须同时包含字母和数字。' }))
      return true
    }

    return false
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateAuthForm({ mode, email, password, confirmPassword, name, role, grade, subject })
    setFieldErrors(nextErrors)
    setNotice(null)
    if (Object.keys(nextErrors).length > 0) {
      setNotice({
        tone: 'error',
        title: '表单校验未通过',
        message: '请先补全必填字段，再继续登录或注册。',
      })
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({
          name,
          email,
          password,
          role,
          age: undefined,
          grade: role === UserRole.Student ? grade : undefined,
          subject: role === UserRole.Teacher || role === UserRole.Assistant ? subject || undefined : undefined,
          bio,
        })
        setNotice({
          tone: 'success',
          title: '注册成功',
          message: `${getDefaultRoleHint(role)} 现在会自动跳转到对应页面。`,
        })
        navigate(getRoleHome(role), { replace: true })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败，请稍后重试。'
      if (mode === 'register') {
        applyRegisterErrorToFields(message)
      }
      setNotice({
        tone: 'error',
        title: mode === 'login' ? '登录失败' : '注册失败',
        message:
          message.includes('email is already registered')
            ? '邮箱已被注册，请直接登录或更换邮箱。'
            : message.includes('username is already registered')
              ? '用户名已被占用，请更换一个用户名。'
              : message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleToggleMode() {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setRole(UserRole.Student)
    setGrade('大一')
    setSubject('')
    setBio('')
    setNotice(null)
    setFieldErrors({})
  }

  return {
    bio,
    confirmPassword,
    email,
    fieldErrors,
    grade,
    handleSubmit,
    handleToggleMode,
    loading,
    mode,
    name,
    notice,
    password,
    role,
    session,
    setBio,
    setConfirmPassword,
    setEmail,
    setGrade,
    setName,
    setPassword,
    setRole,
    setSubject,
    subject,
    submitting,
  }
}
