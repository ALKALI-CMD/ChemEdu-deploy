// 文件说明：学生端考试列表面板，展示已公布/已归档考试并跳转到成绩详情。
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, RefreshCw } from 'lucide-react'
import { createListExamsRequest } from '@/api/exam/ListExamsAPIMessage'
import { sendAPI } from '@/lib/apiClient'
import { useAuth } from '@/components/auth-context'
import { presentExamStatus, formatScore } from '@/components/exam/examDisplay'
import type { Exam } from '@/objects/exam/Exam'
import type { TrainingCohort } from '@/objects/exam/TrainingCohort'
import { ExamStatus } from '@/objects/exam/ExamStatus'

export default function ExamPanel() {
  const { session } = useAuth()
  const sessionToken = session?.sessionToken ?? ''
  const [exams, setExams] = useState<Exam[]>([])
  const [cohorts, setCohorts] = useState<TrainingCohort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cohortFilter, setCohortFilter] = useState<string>('all')

  const cohortNameById = useMemo(
    () => new Map(cohorts.map((cohort) => [cohort.id, cohort.name])),
    [cohorts],
  )

  const load = async () => {
    if (!sessionToken) return
    setLoading(true)
    setError(null)
    try {
      const response = await sendAPI(createListExamsRequest(sessionToken))
      setExams(response.exams)
      setCohorts(response.cohorts)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '考试列表加载失败。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken])

  const visibleExams = exams.filter((exam) => cohortFilter === 'all' || exam.cohortId === cohortFilter)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-sky-800" />
          <p className="text-sm font-semibold text-slate-800">清北营考试窗口</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={cohortFilter}
            onChange={(event) => setCohortFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="all">全部期次</option>
            {cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-sky-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> 刷新
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          正在加载考试列表…
        </div>
      ) : visibleExams.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          暂无已公布成绩的考试。考试阅卷完成并公布后，会自动出现在这里。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleExams.map((exam) => {
            const status = presentExamStatus(exam.status)
            const isReleased = exam.status === ExamStatus.Released || exam.status === ExamStatus.Archived
            return (
              <article key={exam.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{cohortNameById.get(exam.cohortId) ?? ''}</p>
                    <h3 className="text-base font-semibold text-slate-950">{exam.name}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{exam.description}</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                  <div>
                    <dt className="inline">考试时间：</dt>
                    <dd className="inline">{exam.scheduledStart}</dd>
                  </div>
                  <div>
                    <dt className="inline">卷面满分：</dt>
                    <dd className="inline">{formatScore(exam.questions.reduce((sum, question) => sum + question.maxScore, 0))}</dd>
                  </div>
                  <div>
                    <dt className="inline">折合满分：</dt>
                    <dd className="inline">{formatScore(exam.questions.reduce((sum, question) => sum + question.convertedScore, 0))}</dd>
                  </div>
                  <div>
                    <dt className="inline">题量：</dt>
                    <dd className="inline">{exam.questions.length} 题</dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end">
                  {isReleased ? (
                    <Link
                      to={`/student/exams/${exam.id}`}
                      className="rounded-lg bg-sky-900 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                    >
                      查看我的成绩
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">成绩公布后可查看</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
