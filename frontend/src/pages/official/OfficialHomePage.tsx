// 文件说明：清北营官网首页，极简风格：大标题排版 + 细分割线分区，去掉装饰性卡片与彩色元素。
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import OfficialShell from './components/OfficialShell'
import { brand, coursePrograms, facultyMembers } from '@/content/siteContent'

const platformHighlights = [
  {
    title: '全流程考试评定',
    body: '答题卡上传、按题划区、助教判分、折合分统计，全部在线完成，过程分口径公开。',
  },
  {
    title: 'AI 学情分析',
    body: '每场考试自动生成个人短板分析：对比班级平均得分率，定位薄弱模块并给出训练建议。',
  },
  {
    title: '争分复核窗口',
    body: '对判分有异议？成绩公布后 48 小时内一键提交申诉，教研老师逐题复核并公开结论。',
  },
]

const trainingSteps = [
  '教研老师命题：陌生情境 · 完整套卷 · 评分细则',
  '助教阅卷：答题卡划区判分，过程分逐题记录',
  '智能分析：折合分排名 + 短板模块定位',
  '争分复核：窗口期内申诉，教研逐题复核',
]

export default function OfficialHomePage() {
  return (
    <OfficialShell>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 lg:px-6 lg:pt-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] text-slate-400">高中化学奥林匹克 · CChO / IChO 方向</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-5xl">
              {brand.slogan}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-500">{brand.intro}</p>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                to="/enroll"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                预约报名咨询
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/programs"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                查看课程体系 →
              </Link>
            </div>
            <p className="max-w-xl pt-4 text-xs leading-relaxed text-slate-400">{brand.disclaimerShort}</p>
          </div>

          <ol className="space-y-4 border-l border-slate-100 pl-6 lg:pt-2">
            {trainingSteps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="text-sm text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-sm leading-relaxed text-slate-600">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 平台亮点 */}
      <section className="mx-auto max-w-5xl px-4 pb-16 lg:px-6">
        <div className="grid gap-8 border-t border-slate-100 pt-10 md:grid-cols-3">
          {platformHighlights.map((item) => (
            <div key={item.title}>
              <h3 className="text-sm font-medium text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 核心课程 */}
      <section className="mx-auto max-w-5xl px-4 pb-16 lg:px-6">
        <div className="flex items-baseline justify-between border-t border-slate-100 pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">核心课程</h2>
          <Link to="/programs" className="text-sm text-slate-400 transition hover:text-slate-900">
            全部课程 →
          </Link>
        </div>
        <div className="mt-6 divide-y divide-slate-100">
          {coursePrograms.slice(0, 3).map((program) => (
            <Link
              key={program.id}
              to="/programs"
              className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className="text-xs text-slate-400">{program.season}</span>
                <span className="text-base font-medium text-slate-950 transition group-hover:text-slate-500">
                  {program.name}
                </span>
              </div>
              <span className="text-sm text-slate-500">{program.paperCount}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 师资速览 */}
      <section className="mx-auto max-w-5xl px-4 pb-20 lg:px-6">
        <div className="flex items-baseline justify-between border-t border-slate-100 pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">师资团队</h2>
          <Link to="/faculty" className="text-sm text-slate-400 transition hover:text-slate-900">
            完整介绍 →
          </Link>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
          {facultyMembers.map((member) => (
            <div key={member.displayName}>
              <p className="text-sm font-medium text-slate-950">{member.displayName}</p>
              <p className="text-xs text-slate-400">{member.role}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{member.credentials[0]}</p>
            </div>
          ))}
        </div>
      </section>
    </OfficialShell>
  )
}
