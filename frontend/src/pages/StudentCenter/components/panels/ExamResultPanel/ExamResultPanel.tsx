// 文件说明：学生端考试成绩详情面板，展示答题卡判分、折合分、AI 学情分析与争分入口。
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BrainCircuit, MessageSquareWarning, RefreshCw } from 'lucide-react'
import { createGenerateExamAnalysisRequest } from '@/api/exam/GenerateExamAnalysisAPIMessage'
import { createGetStudentExamResultRequest } from '@/api/exam/GetStudentExamResultAPIMessage'
import { sendAPI } from '@/lib/apiClient'
import { useAuth } from '@/components/auth-context'
import SheetRegionOverlay, { type SheetRegionTone } from '@/components/exam/SheetRegionOverlay'
import { formatDateTime, formatScore, presentArgueStatus } from '@/components/exam/examDisplay'
import type { StudentExamResultResponse } from '@/objects/exam/apiTypes/ExamApiResponses'
import { ExamStatus } from '@/objects/exam/ExamStatus'
import ExamAnalysisCard from './components/ExamAnalysisCard'
import ArgueDialog from './components/ArgueDialog'

export default function ExamResultPanel() {
  const { examId } = useParams()
  const { session } = useAuth()
  const sessionToken = session?.sessionToken ?? ''

  const [result, setResult] = useState<StudentExamResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [argueQuestionId, setArgueQuestionId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const load = async () => {
    if (!sessionToken || !examId) return
    setLoading(true)
    setError(null)
    try {
      const response = await sendAPI(createGetStudentExamResultRequest(sessionToken, examId))
      setResult(response)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '成绩加载失败。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, examId])

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">正在加载成绩…</div>
  }

  if (error || !result) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center">
        <p className="text-sm text-rose-700">{error ?? '成绩不存在。'}</p>
        <Link to="/student/exams" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-800">
          <ArrowLeft className="h-4 w-4" /> 返回考试列表
        </Link>
      </div>
    )
  }

  const { exam, sheet, scores, argues, analysis, classSummary } = result
  const scoreByQuestion = new Map(scores.map((entry) => [entry.questionId, entry]))
  const openArgueByQuestion = new Map(
    argues.filter((ticket) => ticket.status === 'open').map((ticket) => [ticket.questionId, ticket]),
  )
  const argueWindowOpen =
    exam.status === ExamStatus.Released &&
    (!exam.argueDeadline || Date.now() < new Date(exam.argueDeadline).getTime())

  const rawTotal = sheet?.rawTotal ?? null
  const convertedTotal = sheet?.convertedTotal ?? null
  const convertedMax = exam.questions.reduce((sum, question) => sum + question.convertedScore, 0)

  const regionTones: Record<string, SheetRegionTone> = {}
  const regionLabels: Record<string, string> = {}
  for (const question of exam.questions) {
    const entry = scoreByQuestion.get(question.id)
    regionLabels[question.id] = `第 ${question.orderIndex} 题`
    if (openArgueByQuestion.has(question.id)) {
      regionTones[question.id] = 'argued'
    } else if (entry) {
      regionTones[question.id] = 'graded'
    }
  }

  const handleGenerateAnalysis = async () => {
    if (!sessionToken || !examId) return
    setGenerating(true)
    setNotice(null)
    try {
      const response = await sendAPI(createGenerateExamAnalysisRequest(sessionToken, examId))
      setResult((current) => (current ? { ...current, analysis: response.analysis } : current))
      setNotice('分析报告已生成。')
    } catch (generateError) {
      setNotice(generateError instanceof Error ? generateError.message : '分析生成失败。')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/student/exams" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-800 hover:text-sky-600">
          <ArrowLeft className="h-4 w-4" /> 返回考试列表
        </Link>
        {notice && <p className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs text-sky-900">{notice}</p>}
      </div>

      {/* 概要 */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">{result.cohortName}</p>
            <h2 className="text-xl font-bold text-slate-950">{exam.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              成绩公布：{formatDateTime(exam.releasedAt)}
              {exam.argueDeadline ? ` · 争分截止：${formatDateTime(exam.argueDeadline)}` : ''}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">卷面总分</p>
              <p className="text-lg font-bold text-slate-950">{formatScore(rawTotal)}</p>
            </div>
            <div className="rounded-xl bg-sky-50 px-4 py-3">
              <p className="text-xs text-sky-800">折合总分</p>
              <p className="text-lg font-bold text-sky-950">{formatScore(convertedTotal)}<span className="text-xs font-normal text-slate-500"> / {formatScore(convertedMax)}</span></p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">班级平均折合</p>
              <p className="text-lg font-bold text-slate-950">{formatScore(classSummary.avgConverted)}</p>
            </div>
          </div>
        </div>
        {!sheet && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            未找到你的答题卡记录。如你确认参加过本场考试，请联系助教老师核对。
          </p>
        )}
        {sheet && argueWindowOpen && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            <MessageSquareWarning className="h-4 w-4" />
            争分窗口开放中：对任意一题的判分有异议，可在对应题目上点击“申请争分”。
          </p>
        )}
        {sheet && !argueWindowOpen && exam.status === ExamStatus.Released && (
          <p className="mt-4 text-xs text-slate-500">本场考试争分窗口已关闭。</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        {/* 答题卡 */}
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">我的答题卡（点击题目区域定位）</h3>
          {sheet ? (
            <SheetRegionOverlay
              imageUrl={sheet.imageDataUrl}
              regions={exam.gradingRegions}
              regionTones={regionTones}
              regionLabels={regionLabels}
              selectedQuestionId={argueQuestionId}
              onSelectRegion={(questionId) => setArgueQuestionId(questionId)}
              emptyHint="本场考试的改题区域尚未公布。"
            />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">无答题卡图片。</p>
          )}
        </section>

        {/* 逐题得分 */}
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">逐题得分与折合分</h3>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2">题目</th>
                  <th className="px-3 py-2">卷面得分</th>
                  <th className="px-3 py-2">折合得分</th>
                  <th className="px-3 py-2">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exam.questions.map((question) => {
                  const entry = scoreByQuestion.get(question.id)
                  const hasOpenArgue = openArgueByQuestion.has(question.id)
                  return (
                    <tr key={question.id} className={question.id === argueQuestionId ? 'bg-amber-50' : ''}>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setArgueQuestionId(question.id)}
                          className="text-left font-medium text-slate-800 hover:text-sky-800"
                        >
                          第 {question.orderIndex} 题
                        </button>
                        <p className="text-xs text-slate-400">{question.topicTag}</p>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {entry ? `${formatScore(entry.score)} / ${formatScore(question.maxScore)}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{entry ? formatScore(entry.convertedScore) : '—'}</td>
                      <td className="px-3 py-2">
                        {hasOpenArgue ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">争分中</span>
                        ) : entry?.adjusted ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">已复核调整</span>
                        ) : entry ? (
                          <button
                            type="button"
                            disabled={!argueWindowOpen}
                            onClick={() => setArgueQuestionId(question.id)}
                            className="rounded-lg border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            申请争分
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">未判分</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {argues.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500">我的争分记录</p>
              {argues.map((ticket) => {
                const status = presentArgueStatus(ticket.status)
                return (
                  <div key={ticket.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{ticket.questionTitle}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${status.className}`}>{status.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">申诉理由：{ticket.reason}</p>
                    {ticket.response && (
                      <p className="mt-1 rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-600">教研复核：{ticket.response}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* AI 分析 */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-sky-800" />
            <h3 className="text-sm font-semibold text-slate-800">AI 学情分析</h3>
            {analysis && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {analysis.source === 'ai' ? `AI 模型：${analysis.model}` : '规则分析引擎'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleGenerateAnalysis()}
            disabled={generating || !sheet}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-900 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
            {analysis ? '重新生成分析' : '生成分析报告'}
          </button>
        </div>
        {analysis ? (
          <ExamAnalysisCard analysis={analysis} />
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            尚未生成分析报告。{sheet ? '点击右上角按钮，基于本次判分结果生成短板分析。' : '生成分析需要先上传答题卡并完成判分。'}
          </p>
        )}
      </section>

      {argueQuestionId && examId && (
        <ArgueDialog
          examId={exam.id}
          question={exam.questions.find((question) => question.id === argueQuestionId) ?? null}
          existingTicket={openArgueByQuestion.get(argueQuestionId) ?? null}
          windowOpen={argueWindowOpen}
          onClose={() => setArgueQuestionId(null)}
          onSubmitted={() => {
            setArgueQuestionId(null)
            void load()
          }}
        />
      )}
    </div>
  )
}
