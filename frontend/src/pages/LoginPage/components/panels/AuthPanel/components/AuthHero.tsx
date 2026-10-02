// 文件说明：登录页品牌面板，极简风格：白底、细分割线、纯文字排版。
import { ClipboardCheck, FlaskConical, LineChart, MessageSquareWarning } from 'lucide-react'
import { brand } from '@/content/siteContent'

const capabilityItems = [
  { label: '考试评定', detail: '答题卡划区判分，过程分逐题记录', icon: FlaskConical },
  { label: '折合分统计', detail: '统一口径排名，班级对比一目了然', icon: LineChart },
  { label: 'AI 学情分析', detail: '定位薄弱模块，给出训练建议', icon: ClipboardCheck },
  { label: '争分复核', detail: '窗口期内申诉，教研逐题复核', icon: MessageSquareWarning },
]

export default function AuthHero() {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 lg:p-10">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-slate-900" />
        <span className="text-lg font-semibold tracking-tight text-slate-950">{brand.name}</span>
        <span className="text-sm text-slate-400">{brand.tagline}</span>
      </div>

      <div className="py-12">
        <h1 className="text-3xl font-semibold leading-snug tracking-tight text-slate-950 lg:text-4xl">
          把每一套模拟卷，
          <br />
          都当成一次真实的国初
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
          从命题、阅卷、折合分到学情分析，考试训练的每个环节都在同一个平台内完成。
        </p>
      </div>

      <div className="space-y-4">
        {capabilityItems.map(({ label, detail, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3 border-t border-slate-100 pt-4">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{detail}</p>
            </div>
          </div>
        ))}
        <p className="border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">{brand.disclaimerShort}</p>
      </div>
    </section>
  )
}
