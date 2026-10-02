import { UserRole } from '@/objects/auth/UserRole'

export type AuthMode = 'login' | 'register'
export type AuthFieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword' | 'name' | 'profile' | 'bio', string>>

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getRoleHome(role: UserRole): string {
  switch (role) {
    case UserRole.Student:
      return '/student'
    case UserRole.Admin:
      return '/admin'
    case UserRole.Analyst:
      return '/analyst'
    case UserRole.Teacher:
    case UserRole.Assistant:
      return '/teacher'
  }
}

export function getDefaultRoleHint(role: UserRole): string {
  if (role === UserRole.Student) {
    return '系统已为学生账号初始化学习相关权限，可直接进入学生中心和考试结果页。'
  }
  if (role === UserRole.Assistant) {
    return '系统已为助教老师账号初始化阅卷相关权限，可进入教师工作台上传答题卡与判分。'
  }
  return '系统已为教研老师账号初始化命题与阅卷管理权限，可进入教师工作台创建考试。'
}

export function validateAuthForm(input: {
  mode: AuthMode
  email: string
  password: string
  confirmPassword: string
  name: string
  role: UserRole
  grade: string
  subject: string
}): AuthFieldErrors {
  const nextErrors: AuthFieldErrors = {}
  if (!emailPattern.test(input.email.trim())) {
    nextErrors.email = '请输入有效邮箱地址。'
  }
  if (input.mode === 'login') {
    if (!input.password) {
      nextErrors.password = '请输入登录密码。'
    }
  } else {
    if (input.password.length < 8 || !/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
      nextErrors.password = '密码至少 8 位，且必须同时包含字母和数字。'
    }
    if (input.confirmPassword !== input.password) {
      nextErrors.confirmPassword = '两次输入的密码不一致。'
    }
    if (input.name.trim().length < 2) {
      nextErrors.name = '用户名至少 2 个字符。'
    }
    if (input.role === UserRole.Student && !input.grade.trim()) {
      nextErrors.profile = '请填写学生年级。'
    }
    if (input.role === UserRole.Teacher && !input.subject.trim()) {
      nextErrors.profile = '请填写教师授课方向。'
    }
  }
  return nextErrors
}
