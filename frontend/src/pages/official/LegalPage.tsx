// 文件说明：清北营官网法律条款页，极简风格：左侧纯文字目录 + 右侧条款正文。
import { Link, useLocation } from 'react-router-dom'
import OfficialShell from './components/OfficialShell'
import { legalDocuments } from '@/content/siteContent'

export default function LegalPage() {
  const location = useLocation()
  const requestedId = new URLSearchParams(location.search).get('doc')
  const active = legalDocuments.find((document) => document.id === requestedId) ?? legalDocuments[0]

  return (
    <OfficialShell>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-14 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">法律条款</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          报名前请完整阅读以下文件；线下合同如与本文条款存在差异，以书面合同为准。
        </p>

        <div className="mt-10 flex flex-col gap-10 border-t border-slate-100 pt-8 lg:flex-row">
          <nav className="flex shrink-0 flex-row gap-x-5 gap-y-1 overflow-x-auto lg:w-40 lg:flex-col lg:overflow-visible">
            {legalDocuments.map((document) => (
              <Link
                key={document.id}
                to={`/legal?doc=${document.id}`}
                className={`whitespace-nowrap py-1 text-sm transition ${
                  document.id === active.id
                    ? 'font-medium text-slate-950'
                    : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {document.title}
              </Link>
            ))}
          </nav>

          <article className="flex-1">
            <h2 className="text-xl font-semibold text-slate-950">{active.title}</h2>
            <div className="mt-6 space-y-6">
              {active.sections.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-sm font-medium text-slate-900">{section.heading}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{section.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 border-t border-slate-100 pt-4 text-xs text-slate-400">
              最近更新：2026 年 10 月 · 如对条款有疑问，请在报名咨询时提出。
            </p>
          </article>
        </div>
      </section>
    </OfficialShell>
  )
}
