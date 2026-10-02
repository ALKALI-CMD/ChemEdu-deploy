// 文件说明：清北营官网教研成果页，极简风格：分割线区块展示模拟卷体系、命题覆盖面与评定平台。
import OfficialShell from './components/OfficialShell'
import { researchBlocks } from '@/content/siteContent'

export default function ResearchPage() {
  return (
    <OfficialShell>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-14 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">教研成果</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          清北营的核心能力是持续产出高难度、贴近实战的模拟卷，并把每一次考试变成可度量的训练数据。
          以下展示教研体系的四个组成部分。
        </p>

        <div className="mt-10 divide-y divide-slate-100 border-t border-slate-100">
          {researchBlocks.map((block) => (
            <article key={block.id} className="py-8">
              <h2 className="text-lg font-medium text-slate-950">{block.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">{block.body}</p>
              <p className="mt-4 text-sm leading-loose text-slate-400">{block.tags.join('　·　')}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <h2 className="text-base font-medium text-slate-950">索取样卷</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            报名前可申请获得一套完整样卷、参考答案与讲评视频片段，用于评估试卷风格与难度是否匹配当前水平。
            请通过报名表单注明"索取样卷"。
          </p>
        </div>
      </section>
    </OfficialShell>
  )
}
