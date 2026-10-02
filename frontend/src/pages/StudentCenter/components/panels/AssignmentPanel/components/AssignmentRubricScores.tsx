import type { Assignment } from '@/objects/course/learning/Assignment'
import { zh } from '@/lib/localization'

type AssignmentRubricScoresProps = {
  assignment: Assignment
}

export default function AssignmentRubricScores({ assignment }: AssignmentRubricScoresProps) {
  if (assignment.rubricScores.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">评分规则明细</p>
      <div className="grid gap-2">
        {assignment.rubric.map((criterion) => {
          const score = assignment.rubricScores.find((item) => item.criterionId === criterion.id)
          const percentage = score ? Math.round((score.score / criterion.maxScore) * 100) : 0
          return (
            <div key={criterion.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{criterion.title}</p>
                <p className="text-slate-600">
                  {score ? `${score.score} / ${criterion.maxScore}` : `待评分 / ${criterion.maxScore}`}
                </p>
              </div>
              {criterion.description ? <p className="mt-1 text-xs text-slate-500">{criterion.description}</p> : null}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${percentage}%` }} />
              </div>
              {score?.comment ? <p className="mt-2 text-xs text-slate-500">{zh(score.comment)}</p> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
