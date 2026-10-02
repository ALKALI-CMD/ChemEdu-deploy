export type RubricDraftCriterion = {
  id: string
  title: string
  description: string
  maxScore: string
}

export const defaultRubricTemplate: RubricDraftCriterion[] = [
  { id: 'template-1', title: '需求完成度', description: '核心功能是否实现，交互链路是否完整。', maxScore: '40' },
  { id: 'template-2', title: '代码质量', description: '结构清晰、命名准确、可维护性良好。', maxScore: '30' },
  { id: 'template-3', title: '文档与说明', description: '提交说明、实验记录或设计解释是否完整。', maxScore: '20' },
  { id: 'template-4', title: '拓展与亮点', description: '额外优化、思考深度或产品完善度。', maxScore: '10' },
]

export function parseRubricText(text: string): RubricDraftCriterion[] {
  return text
    .split('\n')
    .map((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) {
        return null
      }
      const [title = '', description = '', maxScore = '10'] = trimmed.split('|').map((item) => item.trim())
      return {
        id: `rubric-${index + 1}`,
        title,
        description,
        maxScore,
      }
    })
    .filter((criterion): criterion is RubricDraftCriterion => criterion !== null)
}

export function serializeRubric(criteria: RubricDraftCriterion[]) {
  return criteria
    .filter((criterion) => criterion.title.trim())
    .map((criterion) => [criterion.title.trim(), criterion.description.trim(), criterion.maxScore.trim() || '10'].join('|'))
    .join('\n')
}

export function createCriterion(seed: number): RubricDraftCriterion {
  return {
    id: `criterion-${seed}`,
    title: '',
    description: '',
    maxScore: '10',
  }
}

export function calculateRubricTotal(criteria: RubricDraftCriterion[]) {
  return criteria.reduce((sum, criterion) => sum + Math.max(0, Number(criterion.maxScore) || 0), 0)
}
