// 文件说明：清北营官网师资团队页，极简风格：分割线名单展示可核验的竞赛履历摘要。
import OfficialShell from './components/OfficialShell'
import { facultyDisclaimer, facultyMembers } from '@/content/siteContent'

export default function FacultyPage() {
  return (
    <OfficialShell>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-14 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">师资团队</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          清北营的主讲团队由历届中国化学奥林匹克国家集训队成员与国际化学奥林匹克奖牌得主组成，
          另有高校资深教师参与命题审校。以下为宣传用简称与履历摘要，报名前可索取完整姓名与核验材料。
        </p>

        <div className="mt-10 divide-y divide-slate-100 border-t border-slate-100">
          {facultyMembers.map((member) => (
            <article key={member.displayName} className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="text-lg font-medium text-slate-950">{member.displayName}</h2>
                <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                <p className="mt-1 text-xs text-slate-400">{member.subjects.join(' · ')}</p>
              </div>
              <div>
                <ul className="space-y-1.5">
                  {member.credentials.map((credential) => (
                    <li key={credential} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                      {credential}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{member.note}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-slate-400">{facultyDisclaimer}</p>
      </section>
    </OfficialShell>
  )
}
