import { Badge } from '@/components/ui/UiComponents'
import type { EditorStep } from '@/components/course-editor/useCourseEditorModel'
import { stepCopy } from '@/components/course-editor/courseEditorOptions'

type CourseEditorStepSwitcherProps = {
  step: EditorStep
  setStep: (step: EditorStep) => void
  completionMap: Record<EditorStep, boolean>
}

export default function CourseEditorStepSwitcher({
  step,
  setStep,
  completionMap,
}: CourseEditorStepSwitcherProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {(['basic', 'structure', 'publish'] as EditorStep[]).map((item, index) => {
        const isActive = step === item
        const isComplete = completionMap[item]

        return (
          <button
            key={item}
            type="button"
            className={`rounded-3xl border px-4 py-4 text-left transition ${
              isActive ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
            onClick={() => setStep(item)}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm opacity-80">步骤 {index + 1}</p>
              <Badge
                className={
                  isActive
                    ? 'rounded-full border border-white/20 bg-white/15 text-white hover:bg-white/15'
                    : isComplete
                      ? 'rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100'
                      : 'rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100'
                }
              >
                {isComplete ? '已完成' : '待补充'}
              </Badge>
            </div>
            <p className="mt-1 font-semibold">{stepCopy[item].label}</p>
          </button>
        )
      })}
    </div>
  )
}
