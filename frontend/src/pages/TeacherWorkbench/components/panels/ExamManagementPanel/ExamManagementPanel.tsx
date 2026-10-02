// 文件说明：教研端考试管理面板，覆盖期次维护、考试创建、状态流转、区域划分、成绩册与争分处理。
import { useMemo, useState } from 'react'
import { FlaskConical, Plus, Ruler, Table2 } from 'lucide-react'
import { useAuth } from '@/components/auth-context'
import { presentExamStatus } from '@/components/exam/examDisplay'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Exam } from '@/objects/exam/Exam'
import type { TrainingCohort } from '@/objects/exam/TrainingCohort'
import { ExamStatus } from '@/objects/exam/ExamStatus'
import { useExamManagementData } from './hooks/useExamManagementData'
import ExamCohortDialog from './components/ExamCohortDialog'
import ExamFormDialog from './components/ExamFormDialog'
import RegionEditorDialog from './components/RegionEditorDialog'
import ScoreboardDialog from './components/ScoreboardDialog'
import ArgueQueue from './components/ArgueQueue'

type ExamManagementPanelProps = {
  users: UserProfile[]
  canManageExams: boolean
}

export default function ExamManagementPanel({ users, canManageExams }: ExamManagementPanelProps) {
  const { session } = useAuth()
  const management = useExamManagementData(session?.sessionToken ?? '')
  const [cohortFilter, setCohortFilter] = useState('all')
  const [cohortDialog, setCohortDialog] = useState<{ open: boolean; cohort: TrainingCohort | null }>({ open: false, cohort: null })
  const [examForm, setExamForm] = useState<{ open: boolean; exam: Exam | null }>({ open: false, exam: null })
  const [regionEditor, setRegionEditor] = useState<{ open: boolean; exam: Exam | null; initialImage: string | null }>({ open: false, exam: null, initialImage: null })
  const [scoreboard, setScoreboard] = useState<Exam | null>(null)
  const [showArgues, setShowArgues] = useState(false)

  const cohortNameById = useMemo(() => new Map(management.cohorts.map((cohort) => [cohort.id, cohort.name])), [management.cohorts])
  const visibleExams = management.exams.filter((exam) => cohortFilter === 'all' || exam.cohortId === cohortFilter)
  const openArgueCount = management.argues.filter((ticket) => ticket.status === 'open').length

  const openRegionEditor = async (exam: Exam) => {
    let initialImage: string | null = exam.sheetTemplateImage
    if (!initialImage) {
      try {
        const sheets = await management.fetchSheets(exam.id)
        initialImage = sheets[0]?.imageDataUrl ?? null
      } catch {
        initialImage = null
      }
    }
    setRegionEditor({ open: true, exam, initialImage })
  }

  const statusActions: { from: string; to: string; label: string }[] = [
    { from: ExamStatus.Draft, to: ExamStatus.Published, label: '发布考试' },
    { from: ExamStatus.Published, to: ExamStatus.Grading, label: '进入阅卷' },
    { from: ExamStatus.Grading, to: ExamStatus.Released, label: '公布成绩' },
    { from: ExamStatus.Released, to: ExamStatus.Archived, label: '归档' },
  ]

  return (
    <div className="space-y-5">
      {management.notice && (
        <p className="rounded-xl bg-sky-50 px-4 py-2 text-sm text-sky-900">{management.notice}</p>
      )}

      {canManageExams && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={cohortFilter}
              onChange={(event) => setCohortFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">全部期次</option>
              {management.cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCohortDialog({ open: true, cohort: null })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-sky-700"
            >
              <Plus className="h-3.5 w-3.5" /> 新建期次
            </button>
            {management.cohorts.map((cohort) => (
              <button
                key={cohort.id}
                type="button"
                onClick={() => setCohortDialog({ open: true, cohort })}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:border-sky-600 hover:text-sky-800"
              >
                编辑：{cohort.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExamForm({ open: true, exam: null })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-900 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
          >
            <FlaskConical className="h-4 w-4" /> 创建考试
          </button>
        </div>
      )}

      {!canManageExams && (
        <p className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
          当前账号为助教老师视角，仅可查看考试安排；创建考试与状态流转由教研老师操作。
        </p>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">考试安排（{visibleExams.length}）</h3>
        <button
          type="button"
          onClick={() => setShowArgues((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          争分处理{openArgueCount > 0 ? `（${openArgueCount} 条待复核）` : ''}
        </button>
      </div>

      {showArgues ? (
        <ArgueQueue tickets={management.argues} exams={management.exams} onResolve={management.resolveArgue} />
      ) : management.loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">加载中…</div>
      ) : visibleExams.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          暂无考试。请先新建期次，再创建考试。
        </div>
      ) : (
        <div className="space-y-3">
          {visibleExams.map((exam) => {
            const status = presentExamStatus(exam.status)
            const action = statusActions.find((item) => item.from === exam.status)
            const regionCount = Object.keys(exam.gradingRegions).length
            return (
              <article key={exam.id} className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-slate-950">{exam.name}</h4>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {cohortNameById.get(exam.cohortId) ?? ''} · {exam.scheduledStart} ~ {exam.scheduledEnd} · {exam.questions.length} 题 · 划区 {regionCount}/{exam.questions.length} · 争分窗口 {exam.argueHours}h
                    </p>
                  </div>
                  {canManageExams && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExamForm({ open: true, exam })}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-sky-700"
                      >
                        编辑试卷
                      </button>
                      <button
                        type="button"
                        onClick={() => void openRegionEditor(exam)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-sky-700"
                      >
                        <Ruler className="h-3.5 w-3.5" /> 划分区域
                      </button>
                      <button
                        type="button"
                        onClick={() => setScoreboard(exam)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-sky-700"
                      >
                        <Table2 className="h-3.5 w-3.5" /> 成绩册
                      </button>
                      {action && (
                        <button
                          type="button"
                          onClick={() => void management.setExamStatus(exam.id, action.to)}
                          className="rounded-lg bg-sky-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800"
                        >
                          {action.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {canManageExams && action?.to === ExamStatus.Released && regionCount < exam.questions.length && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                    还有 {exam.questions.length - regionCount} 道题未划定改题区域，公布成绩前需要完成全部划区。
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}

      {cohortDialog.open && (
        <ExamCohortDialog
          cohort={cohortDialog.cohort}
          users={users}
          onClose={() => setCohortDialog({ open: false, cohort: null })}
          onSubmit={management.saveCohort}
        />
      )}
      {examForm.open && (
        <ExamFormDialog
          exam={examForm.exam}
          defaultCohortId={cohortFilter !== 'all' ? cohortFilter : null}
          cohorts={management.cohorts}
          onClose={() => setExamForm({ open: false, exam: null })}
          onSubmit={management.saveExam}
        />
      )}
      {regionEditor.open && regionEditor.exam && (
        <RegionEditorDialog
          exam={regionEditor.exam}
          initialImage={regionEditor.initialImage}
          onClose={() => setRegionEditor({ open: false, exam: null, initialImage: null })}
          onSave={(regions, templateImage) =>
            management.saveRegions(regionEditor.exam?.id ?? '', regions, templateImage)
          }
        />
      )}
      {scoreboard && (
        <ScoreboardDialog exam={scoreboard} onClose={() => setScoreboard(null)} fetchScoreboard={management.fetchScoreboard} />
      )}
    </div>
  )
}
