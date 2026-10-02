// 文件说明：学生端 AI 学情分析卡片，展示短板模块、优势模块与训练建议。
import type { ExamAnalysis } from '@/objects/exam/ExamAnalysis'
import { formatPercent, formatDateTime } from '@/components/exam/examDisplay'

type ExamAnalysisCardProps = {
  analysis: ExamAnalysis
}

export default function ExamAnalysisCard({ analysis }: ExamAnalysisCardProps) {
  const { content } = analysis

  return (
    <div className="mt-4 space-y-5">
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">{content.summary}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-rose-700">薄弱模块</p>
          <div className="mt-2 space-y-2">
            {content.weaknesses.length === 0 && <p className="text-sm text-slate-500">未发现明显弱于班级平均的模块。</p>}
            {content.weaknesses.map((weakness) => (
              <div key={`${weakness.topic}-${weakness.questionId}`} className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                <div className="flex items-center justify-between text-sm font-medium text-rose-900">
                  <span>{weakness.topic}</span>
                  <span>
                    {formatPercent(weakness.scoreRate)} <span className="text-xs font-normal text-slate-500">/ 班级 {formatPercent(weakness.classAvgRate)}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{weakness.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-emerald-700">优势模块</p>
          <div className="mt-2 space-y-2">
            {content.strengths.length === 0 && <p className="text-sm text-slate-500">本次暂无显著高于班级平均的模块，继续保持套卷节奏。</p>}
            {content.strengths.map((strength) => (
              <div key={`${strength.topic}-${strength.scoreRate}`} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="flex items-center justify-between text-sm font-medium text-emerald-900">
                  <span>{strength.topic}</span>
                  <span>{formatPercent(strength.scoreRate)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{strength.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {content.focusTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">重点补强：</span>
          {content.focusTopics.map((topic) => (
            <span key={topic} className="rounded-full bg-sky-950/5 px-3 py-1 text-xs font-medium text-sky-900">{topic}</span>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-500">训练建议</p>
        <ol className="mt-2 space-y-1.5">
          {content.suggestions.map((suggestion, index) => (
            <li key={suggestion} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-900/10 text-xs font-bold text-sky-900">
                {index + 1}
              </span>
              {suggestion}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-slate-400">生成时间：{formatDateTime(analysis.generatedAt)} · 分析仅供参考，最终解释以教研老师讲评为准。</p>
    </div>
  )
}
