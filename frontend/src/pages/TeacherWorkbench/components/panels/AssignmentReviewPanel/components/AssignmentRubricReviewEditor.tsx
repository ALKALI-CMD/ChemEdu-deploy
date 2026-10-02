import type { Assignment } from '@/objects/course/learning/Assignment'
import { Button, Input, Textarea } from '@/components/ui/UiComponents'
import {
  buildRubricSummary,
  rubricCommentTemplates,
} from '../functions/teacherReviewUtils'

type AssignmentRubricReviewEditorProps = {
  assignment: Assignment
  scoreDraft: string
  rubricScoreDraft: Record<string, string>
  rubricCommentDraft: Record<string, string>
  onScoreChange: (assignmentId: string, value: string) => void
  onRubricScoreChange: (assignmentId: string, criterionId: string, value: string) => void
  onRubricCommentChange: (assignmentId: string, criterionId: string, value: string) => void
}

export default function AssignmentRubricReviewEditor({
  assignment,
  scoreDraft,
  rubricScoreDraft,
  rubricCommentDraft,
  onScoreChange,
  onRubricScoreChange,
  onRubricCommentChange,
}: AssignmentRubricReviewEditorProps) {
  const rubricSummary = buildRubricSummary(assignment, rubricScoreDraft)

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[140px_1fr]">
        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">总分</label>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="输入分数"
            value={scoreDraft}
            onChange={(event) => onScoreChange(assignment.id, event.target.value)}
          />
        </div>
        {assignment.rubric.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-900">Rubric 汇总</span>
              <span className="text-slate-600">
                {rubricSummary.currentTotal} / {rubricSummary.totalMax}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${rubricSummary.percentage}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => onScoreChange(assignment.id, String(rubricSummary.currentTotal))}
              >
                用 Rubric 总分回填
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {assignment.rubric.length > 0 ? (
        <div className="grid gap-2">
          {assignment.rubric.map((criterion) => {
            const scoreValue = Number(rubricScoreDraft[criterion.id] ?? criterion.maxScore)
            const normalized = Math.max(0, Math.min(criterion.maxScore, Number.isFinite(scoreValue) ? scoreValue : criterion.maxScore))
            const percentage = Math.round((normalized / criterion.maxScore) * 100)
            const currentComment =
              rubricCommentDraft[criterion.id] ??
              assignment.rubricScores.find((item) => item.criterionId === criterion.id)?.comment ??
              ''

            return (
              <div key={criterion.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{criterion.title}</p>
                    {criterion.description ? <p className="mt-1 text-xs text-slate-500">{criterion.description}</p> : null}
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={criterion.maxScore}
                    className="w-28 bg-white"
                    value={rubricScoreDraft[criterion.id] ?? ''}
                    onChange={(event) => onRubricScoreChange(assignment.id, criterion.id, event.target.value)}
                  />
                </div>
                <Textarea
                  className="mt-3 min-h-20 bg-white"
                  placeholder="填写该维度评语"
                  value={currentComment}
                  onChange={(event) => onRubricCommentChange(assignment.id, criterion.id, event.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {rubricCommentTemplates.map((template) => (
                    <Button
                      key={`${criterion.id}-${template}`}
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() =>
                        onRubricCommentChange(
                          assignment.id,
                          criterion.id,
                          currentComment ? `${currentComment}\n${template}` : template,
                        )
                      }
                    >
                      评语模板
                    </Button>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    当前得分 {normalized} / {criterion.maxScore}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}
