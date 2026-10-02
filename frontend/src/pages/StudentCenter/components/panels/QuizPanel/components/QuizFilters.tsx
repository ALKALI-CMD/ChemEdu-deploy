import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { Quiz } from '@/objects/course/learning/Quiz'

export type QuizFilterKey = 'all' | 'upcoming' | 'ongoing' | 'finished'

type QuizFiltersProps = {
  quizzes: Quiz[]
  value: QuizFilterKey
  onChange: (value: QuizFilterKey) => void
}

export default function QuizFilters({ quizzes, value, onChange }: QuizFiltersProps) {
  const counts = {
    all: quizzes.length,
    upcoming: quizzes.filter((item) => item.status === QuizStatus.Upcoming).length,
    ongoing: quizzes.filter((item) => item.status === QuizStatus.Ongoing).length,
    finished: quizzes.filter((item) => item.status === QuizStatus.Finished).length,
  }

  const options: { key: QuizFilterKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'upcoming', label: '即将开始' },
    { key: 'ongoing', label: '进行中' },
    { key: 'finished', label: '已结束' },
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
