import { BarChart3, Bell, BookOpen, ClipboardCheck, ClipboardList, Compass, FileCheck2, FlaskConical, GraduationCap, LineChart, Search, Settings, ShieldCheck } from 'lucide-react'

export type ShellNavItem = {
  to: string
  label: string
  end?: boolean
}

export type ShellPrimaryNavItem = ShellNavItem & {
  icon: typeof Compass
}

export const educationRoleLabel: Record<string, string> = {
  student: '学生',
  teacher: '教研老师',
  assistant: '助教老师',
  analyst: '数据分析处',
  admin: '校长',
}

const primaryNavByRole: Record<string, ShellPrimaryNavItem[]> = {
  admin: [
    { to: '/admin', label: '平台总览', icon: ShieldCheck, end: true },
    { to: '/admin/audits', label: '课程审核', icon: BookOpen, end: true },
    { to: '/admin/users', label: '用户权限', icon: GraduationCap, end: true },
    { to: '/analyst', label: '考试数据', icon: LineChart, end: true },
    { to: '/admin/organization', label: '教学组织', icon: BookOpen, end: true },
    { to: '/admin/business', label: '经营看板', icon: BarChart3, end: true },
    { to: '/admin/governance', label: '内容治理', icon: Compass, end: true },
    { to: '/admin/system', label: '系统治理', icon: Settings, end: true },
    { to: '/notifications', label: '消息中心', icon: Bell, end: true },
  ],
  student: [
    { to: '/student', label: '首页', icon: GraduationCap, end: true },
    { to: '/courses', label: '发现', icon: Compass, end: true },
    { to: '/student/courses', label: '课程', icon: BookOpen, end: true },
    { to: '/student/exams', label: '考试', icon: FlaskConical, end: true },
    { to: '/student/assignments', label: '作业', icon: ClipboardList, end: true },
    { to: '/student/quizzes', label: '测验', icon: FileCheck2, end: true },
    { to: '/student/grades', label: '成绩', icon: BarChart3, end: true },
    { to: '/notifications', label: '消息中心', icon: Bell, end: true },
    { to: '/search', label: '全局搜索', icon: Search, end: true },
  ],
  teacher: [
    { to: '/teacher', label: '首页', icon: BookOpen, end: true },
    { to: '/teacher/exams', label: '考试管理', icon: FlaskConical, end: true },
    { to: '/teacher/grading', label: '阅卷', icon: ClipboardCheck, end: true },
    { to: '/teacher/gradebook', label: '成绩册', icon: BarChart3, end: true },
    { to: '/teacher/courses', label: '课程', icon: BookOpen, end: true },
    { to: '/teacher/publishing', label: '发布', icon: ClipboardList, end: true },
    { to: '/teacher/reviews', label: '批改', icon: FileCheck2, end: true },
    { to: '/teacher/discussions', label: '讨论', icon: Compass, end: true },
    { to: '/notifications', label: '消息中心', icon: Bell, end: true },
  ],
  assistant: [
    { to: '/teacher', label: '首页', icon: BookOpen, end: true },
    { to: '/teacher/grading', label: '阅卷', icon: ClipboardCheck, end: true },
    { to: '/teacher/gradebook', label: '成绩册', icon: BarChart3, end: true },
    { to: '/teacher/courses', label: '课程', icon: BookOpen, end: true },
    { to: '/teacher/publishing', label: '发布', icon: ClipboardList, end: true },
    { to: '/teacher/reviews', label: '批改', icon: FileCheck2, end: true },
    { to: '/notifications', label: '消息中心', icon: Bell, end: true },
  ],
  analyst: [
    { to: '/analyst', label: '数据看板', icon: LineChart, end: true },
    { to: '/notifications', label: '消息中心', icon: Bell, end: true },
    { to: '/search', label: '全局搜索', icon: Search, end: true },
  ],
}

export function getPrimaryNavByRole(role?: string | null) {
  if (!role) {
    return []
  }
  return primaryNavByRole[role] ?? []
}
