// 文件说明：清北营官网报名咨询页，极简风格：细边框表单 + 纯文字材料清单与常见问题。
import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import OfficialShell from './components/OfficialShell'
import { createSubmitEnrollmentLeadRequest } from '@/api/exam/SubmitEnrollmentLeadAPIMessage'
import { sendAPI } from '@/lib/apiClient'
import { brand, coursePrograms, enrollmentChecklist, faqs } from '@/content/siteContent'

const gradeOptions = ['高一', '高二', '高三']
const stageOptions = ['国初（省级赛区）', '省队选拔', '国决冲刺', '兴趣学习']

type FormState = {
  studentName: string
  contact: string
  gradeLevel: string
  targetStage: string
  courseInterest: string
  message: string
}

const initialForm: FormState = {
  studentName: '',
  contact: '',
  gradeLevel: '高二',
  targetStage: '国初（省级赛区）',
  courseInterest: coursePrograms[0].name,
  message: '',
}

const inputClass =
  'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500'

export default function EnrollPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const courseOptions = useMemo(() => coursePrograms.map((program) => program.name), [])

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.studentName.trim()) {
      setError('请填写学生姓名。')
      return
    }
    if (!form.contact.trim()) {
      setError('请填写联系电话或微信。')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await sendAPI(createSubmitEnrollmentLeadRequest({ ...form }))
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '提交失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OfficialShell>
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-14 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">报名咨询</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">{brand.contactNote}</p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* 表单 */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-start gap-3 py-6">
                <CheckCircle2 className="h-8 w-8 text-slate-900" />
                <h2 className="text-lg font-semibold text-slate-950">提交成功</h2>
                <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                  我们已收到你的咨询信息，招生老师将在 1 个工作日内通过你留下的联系方式与你联系。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm)
                    setSubmitted(false)
                  }}
                  className="mt-2 text-sm text-slate-400 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                  再填一份
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-slate-800">学生姓名 *</span>
                    <input
                      value={form.studentName}
                      onChange={(event) => update({ studentName: event.target.value })}
                      className={inputClass}
                      placeholder="请填写学生姓名"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-slate-800">联系电话 / 微信 *</span>
                    <input
                      value={form.contact}
                      onChange={(event) => update({ contact: event.target.value })}
                      className={inputClass}
                      placeholder="方便招生老师联系"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-slate-800">当前年级</span>
                    <select
                      value={form.gradeLevel}
                      onChange={(event) => update({ gradeLevel: event.target.value })}
                      className={inputClass}
                    >
                      {gradeOptions.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-slate-800">目标赛段</span>
                    <select
                      value={form.targetStage}
                      onChange={(event) => update({ targetStage: event.target.value })}
                      className={inputClass}
                    >
                      {stageOptions.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="font-medium text-slate-800">意向班型</span>
                  <select
                    value={form.courseInterest}
                    onChange={(event) => update({ courseInterest: event.target.value })}
                    className={inputClass}
                  >
                    {courseOptions.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-slate-800">留言（现有水平 / 想解决的问题 / 是否需要索取样卷）</span>
                  <textarea
                    value={form.message}
                    onChange={(event) => update({ message: event.target.value })}
                    rows={4}
                    className={inputClass}
                    placeholder="例如：高二，已过省一，想冲刺省队，希望索取一套国初模拟样卷。"
                  />
                </label>
                {error && <p className="text-sm text-rose-700">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-slate-950 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {submitting ? '提交中…' : '提交咨询'}
                </button>
                <p className="text-xs text-slate-400">提交即表示同意我们按隐私政策使用上述信息与你联系。</p>
              </form>
            )}
          </div>

          {/* 材料清单 */}
          <div className="lg:border-l lg:border-slate-100 lg:pl-10">
            <h2 className="text-base font-medium text-slate-950">{enrollmentChecklist.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{enrollmentChecklist.intro}</p>
            <ol className="mt-5 space-y-3">
              {enrollmentChecklist.items.map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                  <span className="text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 border-t border-slate-100 pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">常见问题</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-slate-900 marker:hidden">
                  {faq.q}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </OfficialShell>
  )
}
