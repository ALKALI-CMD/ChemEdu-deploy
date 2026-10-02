// 文件说明：助教阅卷面板，支持上传答题卡、查看阅卷进度并进入逐题判分工作台。
import { useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { formatScore } from '@/components/exam/examDisplay'
import { presentSheetStatus } from '@/components/exam/examDisplay'
import { useAuth } from '@/components/auth-context'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { AnswerSheet } from '@/objects/exam/AnswerSheet'
import { useExamGradingData } from './hooks/useExamGradingData'
import SheetGrader from './components/SheetGrader'

type ExamGradingPanelProps = {
  users: UserProfile[]
}

export default function ExamGradingPanel({ users }: ExamGradingPanelProps) {
  const { session } = useAuth()
  const sessionToken = session?.sessionToken ?? ''
  const grading = useExamGradingData(sessionToken)
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null)
  const [uploadStudentId, setUploadStudentId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const selectedExam = grading.exams.find((exam) => exam.id === grading.selectedExamId) ?? null
  const cohortById = useMemo(
    () => new Map(grading.cohorts.map((cohort) => [cohort.id, cohort])),
    [grading.cohorts],
  )

  const candidateStudents = useMemo(() => {
    if (!selectedExam) return []
    const memberIds = new Set(cohortById.get(selectedExam.cohortId)?.memberIds ?? [])
    return users.filter((user) => user.role === 'student' && (memberIds.size === 0 || memberIds.has(user.id)))
  }, [selectedExam, cohortById, users])

  const handleUpload = async (file: File | null) => {
    if (!file || !uploadStudentId) {
      setUploadError('请先选择学生与答题卡图片。')
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      await grading.uploadSheet(uploadStudentId, file)
    } catch (uploadCatch) {
      setUploadError(uploadCatch instanceof Error ? uploadCatch.message : '上传失败，请重试。')
    } finally {
      setUploading(false)
    }
  }

  const activeSheet = grading.sheets.find((sheet) => sheet.id === activeSheetId) ?? null
  const gradedCount = grading.sheets.filter((sheet) => sheet.status === 'graded').length

  return (
    <div className="space-y-5">
      {/* 考试选择与统计 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-700">考试：</span>
            <select
              value={grading.selectedExamId ?? ''}
              onChange={(event) => {
                setActiveSheetId(null)
                grading.setSelectedExamId(event.target.value || null)
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              {grading.exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </label>
          {selectedExam && (
            <span className="text-xs text-slate-500">
              共 {grading.sheets.length} 张答题卡 · 已阅完 {gradedCount} 张 · 待判 {grading.sheets.length - gradedCount} 张
            </span>
          )}
        </div>
        {grading.notice && <p className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs text-sky-900">{grading.notice}</p>}
      </div>

      {grading.loadingExams || grading.loadingSheets ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">加载中…</div>
      ) : !selectedExam ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          暂无可阅卷的考试，请等待教研老师创建考试。
        </div>
      ) : activeSheet && selectedExam ? (
        <SheetGrader
          exam={selectedExam}
          sheet={activeSheet}
          scores={grading.scores}
          argues={grading.argues}
          onBack={() => setActiveSheetId(null)}
          onSaveScore={grading.saveScore}
          onSwitchSheet={(sheetId) => setActiveSheetId(sheetId)}
          sheetIds={grading.sheets.map((sheet) => sheet.id)}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          {/* 上传答题卡 */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Upload className="h-4 w-4 text-sky-800" /> 上传答题卡
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              支持扫描件或照片，系统会自动压缩；同一学生重复上传会覆盖旧答题卡并清空其已有判分。
            </p>
            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">学生</span>
                <select
                  value={uploadStudentId}
                  onChange={(event) => setUploadStudentId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">请选择学生</option>
                  {candidateStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {grading.sheets.some((sheet) => sheet.studentId === student.id) ? '（已有答题卡，将覆盖）' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">答题卡图片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleUpload(event.target.files?.[0] ?? null)}
                  disabled={uploading || !uploadStudentId}
                  className="mt-1 w-full rounded-lg border border-dashed border-slate-300 px-3 py-6 text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-900 file:px-3 file:py-1.5 file:text-white disabled:opacity-50"
                />
              </label>
              {uploading && <p className="text-xs text-sky-800">正在压缩并上传答题卡…</p>}
              {uploadError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{uploadError}</p>}
            </div>
          </section>

          {/* 答题卡队列 */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
            <h3 className="text-sm font-semibold text-slate-800">答题卡队列</h3>
            {grading.sheets.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">本场考试还没有上传答题卡。</p>
            ) : (
              <div className="mt-3 grid gap-2">
                {grading.sheets.map((sheet) => (
                  <SheetQueueCard
                    key={sheet.id}
                    sheet={sheet}
                    hasOpenArgue={grading.argues.some((ticket) => ticket.sheetId === sheet.id && ticket.status === 'open')}
                    onOpen={() => setActiveSheetId(sheet.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function SheetQueueCard({
  sheet,
  hasOpenArgue,
  onOpen,
}: {
  sheet: AnswerSheet
  hasOpenArgue: boolean
  onOpen: () => void
}) {
  const status = presentSheetStatus(sheet.status)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-sky-600"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {sheet.studentName}
          {hasOpenArgue && <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">有争分</span>}
        </p>
        <p className="text-xs text-slate-500">上传 {sheet.uploadedAt.slice(0, 19).replace('T', ' ')} · 判分 {sheet.rawTotal === null ? '未开始' : `进行中`}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">折合 {formatScore(sheet.convertedTotal)}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
      </div>
    </button>
  )
}
