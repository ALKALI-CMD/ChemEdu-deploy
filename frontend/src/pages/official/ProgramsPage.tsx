// 文件说明：清北营官网课程体系页，极简风格：分割线列表展示五条产品线与适读人群。
import { Link } from 'react-router-dom'
import OfficialShell from './components/OfficialShell'
import { coursePrograms } from '@/content/siteContent'

export default function ProgramsPage() {
  return (
    <OfficialShell>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-14 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">课程体系</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          从系统训练到赛前冲刺，选择适合当前阶段的课程。
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {coursePrograms.map((program) => (
            <article key={program.id} className="program-card flex flex-col gap-5">
              <div>
                <p className="text-xs text-slate-400">{program.season}</p>
                <h2 className="mt-1 text-lg font-medium text-slate-950">{program.name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  目标：{program.target}
                  <br />
                  周期：{program.duration}
                  <br />
                  配套：{program.paperCount}
                </p>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {program.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                    {highlight}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed text-slate-500">
                <span className="text-slate-800">适读：</span>
                {program.suitableFor}
              </p>
              <Link to="/enroll" className="academic-link mt-auto">咨询课程 →</Link>
            </article>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <h2 className="text-base font-medium text-slate-950">报名说明</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            所有班型均支持报名前索取完整样卷、答案与讲评视频；学费只接受汇入合同主体对公账户并提供发票。
            具体期次、费用与优惠以当期招生简章与书面合同为准。
          </p>
          <Link to="/enroll" className="mt-5 inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
            提交报名咨询 →
          </Link>
        </div>
      </section>
    </OfficialShell>
  )
}
