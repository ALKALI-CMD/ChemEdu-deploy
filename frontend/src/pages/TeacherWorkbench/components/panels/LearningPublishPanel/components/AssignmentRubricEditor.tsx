import { useMemo } from 'react'
import { Button, Input, Label, Textarea } from '@/components/ui/UiComponents'
import {
  calculateRubricTotal,
  createCriterion,
  defaultRubricTemplate,
  parseRubricText,
  serializeRubric,
  type RubricDraftCriterion,
} from '../functions/assignmentRubricModel'

type AssignmentRubricEditorProps = {
  assignmentRubricText: string
  setAssignmentRubricText: (value: string) => void
}

export default function AssignmentRubricEditor({
  assignmentRubricText,
  setAssignmentRubricText,
}: AssignmentRubricEditorProps) {
  const rubricCriteria = useMemo(() => parseRubricText(assignmentRubricText), [assignmentRubricText])
  const rubricTotal = useMemo(() => calculateRubricTotal(rubricCriteria), [rubricCriteria])

  function updateCriteria(nextCriteria: RubricDraftCriterion[]) {
    setAssignmentRubricText(serializeRubric(nextCriteria))
  }

  function handleCriterionChange(id: string, patch: Partial<RubricDraftCriterion>) {
    const nextCriteria = rubricCriteria.map((criterion) => (criterion.id === id ? { ...criterion, ...patch } : criterion))
    updateCriteria(nextCriteria)
  }

  function handleAddCriterion() {
    updateCriteria([...rubricCriteria, createCriterion(Date.now())])
  }

  function handleRemoveCriterion(id: string) {
    updateCriteria(rubricCriteria.filter((criterion) => criterion.id !== id))
  }

  function handleUseTemplate() {
    updateCriteria(defaultRubricTemplate)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950">Rubric 评分标准（选填）</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={handleUseTemplate}>
            套用默认模板
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={handleAddCriterion}>
            新增评分维度
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {rubricCriteria.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            暂无评分维度。
          </div>
        ) : null}

        {rubricCriteria.map((criterion) => (
          <div key={criterion.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[1.2fr_1.5fr_120px]">
              <div className="grid gap-2">
                <Label>评分维度（选填）</Label>
                <Input
                  value={criterion.title}
                  placeholder="例如：需求完成度"
                  onChange={(event) => handleCriterionChange(criterion.id, { title: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>评分说明（选填）</Label>
                <Input
                  value={criterion.description}
                  placeholder="例如：核心功能是否实现，交互链路是否完整"
                  onChange={(event) => handleCriterionChange(criterion.id, { description: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>满分（选填）</Label>
                <Input
                  type="number"
                  min={1}
                  value={criterion.maxScore}
                  onChange={(event) => handleCriterionChange(criterion.id, { maxScore: event.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => handleRemoveCriterion(criterion.id)}>
                删除维度
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
        <span>当前共 {rubricCriteria.length} 个评分维度</span>
        <span>Rubric 总分：{rubricTotal}</span>
      </div>

      <div className="mt-4 grid gap-2">
        <Label htmlFor="assignment-rubric-raw">高级模式：原始 Rubric 文本（选填）</Label>
        <Textarea
          id="assignment-rubric-raw"
          className="min-h-24 bg-white font-mono text-xs"
          placeholder="每行一项：维度标题|说明|满分，例如：功能实现|核心功能是否完成|40"
          value={assignmentRubricText}
          onChange={(event) => setAssignmentRubricText(event.target.value)}
        />
      </div>
    </div>
  )
}
