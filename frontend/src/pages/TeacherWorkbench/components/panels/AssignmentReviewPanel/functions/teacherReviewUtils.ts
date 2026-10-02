import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'

const reviewableStatusLabel: Record<SubmissionStatus, string> = {
  [SubmissionStatus.Pending]: '待提交',
  [SubmissionStatus.Submitted]: '待批改',
  [SubmissionStatus.Reviewed]: '已批改',
}

const feedbackTemplates = [
  '结构清晰，已覆盖主要要求，可以继续补充细节和实验结论。',
  '请补充关键论证，并在下一版中标明本次修改点。',
  '提交完整，建议再检查边界情况和文档说明。',
]

const rubricCommentTemplates = [
  '这一维度已经达到要求，可以继续保持。',
  '完成度不错，但还可以补充更多证据或过程说明。',
  '建议对照评分标准逐项完善，尤其是论证与表达部分。',
]

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

function buildRubricSummary(assignment: Assignment, rubricScoreDraft: Record<string, string>) {
  const totalMax = assignment.rubric.reduce((sum, criterion) => sum + criterion.maxScore, 0)
  const currentTotal = assignment.rubric.reduce((sum, criterion) => {
    const source = rubricScoreDraft[criterion.id] ?? String(criterion.maxScore)
    const numeric = Number(source)
    const safe = Number.isFinite(numeric) ? numeric : criterion.maxScore
    return sum + Math.max(0, Math.min(criterion.maxScore, safe))
  }, 0)

  return {
    totalMax,
    currentTotal,
    percentage: totalMax > 0 ? Math.round((currentTotal / totalMax) * 100) : 0,
  }
}

function scoreDeltaLabel(current: number, previous?: number) {
  if (previous === undefined) return '首次评分'
  const delta = current - previous
  if (delta === 0) return '与上次持平'
  return delta > 0 ? `较上次提升 ${delta} 分` : `较上次下降 ${Math.abs(delta)} 分`
}

export {
  buildRubricSummary,
  feedbackTemplates,
  reviewableStatusLabel,
  rubricCommentTemplates,
  scoreDeltaLabel,
  text,
}
