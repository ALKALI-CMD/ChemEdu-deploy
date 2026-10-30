// 文件说明：清北营官网学员成果页，极简风格：编号列表公布成绩统计口径与核验承诺。
import OfficialShell from './components/OfficialShell'
import { resultsPolicy } from '@/content/siteContent'

export default function ResultsPage() {
  return (
    <OfficialShell>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-14 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{resultsPolicy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          所有对外展示的学员成绩均遵循以下统计口径。
        </p>

        <div className="mt-10 divide-y divide-slate-100 border-t border-slate-100">
          {resultsPolicy.commitments.map((commitment, index) => (
            <article key={commitment.label} className="grid gap-x-10 gap-y-1 py-6 md:grid-cols-[80px_1fr]">
              <span className="text-sm text-slate-300">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-base font-medium text-slate-950">{commitment.label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{commitment.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl border-l-2 border-slate-200 pl-5 text-sm leading-relaxed text-slate-600">
          {resultsPolicy.statement}
        </p>
      </section>
    </OfficialShell>
  )
}
