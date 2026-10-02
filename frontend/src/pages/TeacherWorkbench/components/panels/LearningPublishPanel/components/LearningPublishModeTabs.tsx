type LearningPublishMode = 'assignment' | 'quiz'

type LearningPublishModeTabsProps = {
  value: LearningPublishMode
  onChange: (value: LearningPublishMode) => void
}

export default function LearningPublishModeTabs({ value, onChange }: LearningPublishModeTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={
          value === 'assignment'
            ? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white'
            : 'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700'
        }
        onClick={() => onChange('assignment')}
      >
        发布作业
      </button>
      <button
        type="button"
        className={
          value === 'quiz'
            ? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white'
            : 'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700'
        }
        onClick={() => onChange('quiz')}
      >
        发布测验
      </button>
    </div>
  )
}

export type { LearningPublishMode }
