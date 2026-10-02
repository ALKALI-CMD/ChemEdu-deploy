import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'

export const reportTargetTypeLabel: Record<PlatformReport['targetType'], string> = {
  course: '课程',
  user: '用户',
  discussion: '讨论主题',
  reply: '讨论回复',
}

export function isBanAppeal(report: PlatformReport) {
  return report.reason.includes('封禁申诉') || report.targetLabel.startsWith('封禁申诉')
}

export function isUserReport(report: PlatformReport) {
  return report.targetType === 'user' && !isBanAppeal(report)
}
