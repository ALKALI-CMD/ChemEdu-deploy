type QuizDeliveryOptionsProps = {
  shuffleQuestions: boolean
  shuffleOptions: boolean
  onShuffleQuestionsChange: (value: boolean) => void
  onShuffleOptionsChange: (value: boolean) => void
}

export default function QuizDeliveryOptions({
  shuffleQuestions,
  shuffleOptions,
  onShuffleQuestionsChange,
  onShuffleOptionsChange,
}: QuizDeliveryOptionsProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={shuffleQuestions}
          onChange={(event) => onShuffleQuestionsChange(event.target.checked)}
        />
        发布时为每位学生随机打乱题目顺序
      </label>
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input type="checkbox" checked={shuffleOptions} onChange={(event) => onShuffleOptionsChange(event.target.checked)} />
        发布时随机打乱客观题选项顺序
      </label>
    </div>
  )
}
