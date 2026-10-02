import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'

export const assignmentStatusLabel: Record<SubmissionStatus, string> = {
  [SubmissionStatus.Pending]: '待提交',
  [SubmissionStatus.Submitted]: '待批改',
  [SubmissionStatus.Reviewed]: '已批改',
}

export function parseDeadline(value: string) {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function isDeadlinePassed(deadline: string) {
  const parsed = parseDeadline(deadline)
  return parsed === null ? false : parsed < Date.now()
}
