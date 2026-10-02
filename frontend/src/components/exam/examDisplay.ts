// 文件说明：考试评定域展示工具，集中维护状态文案、配色与格式化函数。
import { ExamStatus } from '@/objects/exam/ExamStatus'

export const examStatusPresentation: Record<string, { label: string; className: string }> = {
  [ExamStatus.Draft]: { label: '草稿', className: 'bg-slate-100 text-slate-600' },
  [ExamStatus.Published]: { label: '已发布 · 待考', className: 'bg-sky-50 text-sky-800' },
  [ExamStatus.Grading]: { label: '阅卷中', className: 'bg-amber-50 text-amber-800' },
  [ExamStatus.Released]: { label: '成绩已公布', className: 'bg-emerald-50 text-emerald-800' },
  [ExamStatus.Archived]: { label: '已归档', className: 'bg-slate-100 text-slate-500' },
}

export function presentExamStatus(status: string): { label: string; className: string } {
  return examStatusPresentation[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
}

export function presentSheetStatus(status: string): { label: string; className: string } {
  if (status === 'graded') {
    return { label: '已阅完', className: 'bg-emerald-50 text-emerald-800' }
  }
  return { label: '待判分', className: 'bg-amber-50 text-amber-800' }
}

export const argueStatusPresentation: Record<string, { label: string; className: string }> = {
  open: { label: '待复核', className: 'bg-rose-50 text-rose-700' },
  resolved: { label: '已复核', className: 'bg-emerald-50 text-emerald-800' },
  rejected: { label: '已驳回', className: 'bg-slate-100 text-slate-500' },
}

export function presentArgueStatus(status: string): { label: string; className: string } {
  return argueStatusPresentation[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString('zh-CN', { hour12: false })
}
