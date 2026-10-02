import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'

export type AssignmentFilterKey = 'all' | 'pending' | 'submitted' | 'reviewed'

type AssignmentFiltersProps = {
  assignments: Assignment[]
  value: AssignmentFilterKey
  onChange: (value: AssignmentFilterKey) => void
}

export default function AssignmentFilters({ assignments, value, onChange }: AssignmentFiltersProps) {
  const counts = {
    all: assignments.length,
    pending: assignments.filter((item) => item.submissionStatus === SubmissionStatus.Pending).length,
    submitted: assignments.filter((item) => item.submissionStatus === SubmissionStatus.Submitted).length,
    reviewed: assignments.filter((item) => item.submissionStatus === SubmissionStatus.Reviewed).length,
  }

  const options: { key: AssignmentFilterKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待提交' },
    { key: 'submitted', label: '待批改' },
    { key: 'reviewed', label: '已批改' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`rounded-full border px-4 py-2 text-sm transition ${
            value === option.key
              ? 'border-slate-950 bg-slate-950 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => onChange(option.key)}
        >
          {option.label} {counts[option.key]}
        </button>
      ))}
    </div>
  )
}
