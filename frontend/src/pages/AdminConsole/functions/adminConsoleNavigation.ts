import type { ShellNavItem } from '@/components/education-shell/navigation'

const governanceSecondaryNav: ShellNavItem[] = [
  { to: '/admin/governance', label: '治理入口', end: true },
  { to: '/admin/governance/reports', label: '举报工单', end: true },
  { to: '/admin/governance/discussions', label: '讨论治理', end: true },
]

const organizationSecondaryNav: ShellNavItem[] = [
  { to: '/admin/organization', label: '组织入口', end: true },
  { to: '/admin/organization/enrollments', label: '选课审核', end: true },
  { to: '/admin/organization/waitlist', label: '候补名单', end: true },
  { to: '/admin/organization/structure', label: '组织结构', end: true },
  { to: '/admin/organization/students', label: '学生调班', end: true },
  { to: '/admin/organization/courses', label: '课程分班', end: true },
  { to: '/admin/organization/logs', label: '变更日志', end: true },
]

export { governanceSecondaryNav, organizationSecondaryNav }
