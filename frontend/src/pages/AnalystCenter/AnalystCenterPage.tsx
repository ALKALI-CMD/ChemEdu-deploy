// 文件说明：数据分析处统计看板，展示各考试的折合分分布、题目得分率与期次趋势。
import { useEffect, useMemo, useState } from 'react'
import { LineChart, RefreshCw } from 'lucide-react'
import EducationShell from '@/components/EducationShell'
import { createGetExamStatisticsRequest } from '@/api/exam/GetExamStatisticsAPIMessage'
import { sendAPI } from '@/lib/apiClient'
import { useAuth } from '@/components/auth-context'
import { formatPercent, formatScore, presentExamStatus } from '@/components/exam/examDisplay'
import type { ExamStatisticsResponse } from '@/objects/exam/apiTypes/InsightApiResponses'

export default function AnalystCenterPage() {
  const { session } = useAuth()
  const sessionToken = session?.sessionToken ?? ''
  const [statistics, setStatistics] = useState<ExamStatisticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cohortFilter, setCohortFilter] = useState('all')
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null)

  const load = async (cohortId: string | null) => {
    if (!sessionToken) return
    setLoading(true)
    setError(null)
    try {
      const response = await sendAPI(createGetExamStatisticsRequest(sessionToken, cohortId))
      setStatistics(response)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '统计数据加载失败。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken])

  const cohortOptions = useMemo(() => {
    const map = new Map<string, string>()
    statistics?.summaries.forEach((summary) => map.set(summary.cohortId, summary.cohortName))
    return map
  }, [statistics])

  const summaries = statistics?.summaries.filter((summary) => cohortFilter === 'all' || summary.cohortId === cohortFilter) ?? []

  return (
    <EducationShell
      eyebrow="数据分析处"
      title="考试数据看板"
      description="折合分分布、题目得分率与期次趋势"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={cohortFilter}
              onChange={(event) => {
                setCohortFilter(event.target.value)
                void load(event.target.value === 'all' ? null : event.target.value)
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">全部期次</option>
              {Array.from(cohortOptions.entries()).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void load(cohortFilter === 'all' ? null : cohortFilter)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-sky-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> 刷新
          </button>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
            <LineChart className="mx-auto mb-2 h-6 w-6 text-slate-300" />
            正在汇总考试数据…
          </div>
        ) : summaries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
            暂无考试统计数据。
          </div>
        ) : (
          <div className="space-y-4">
            {summaries.map((summary) => {
              const status = presentExamStatus(summary.status)
              const expanded = expandedExamId === summary.examId
              return (
                <article key={summary.examId} className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-950">{summary.examName}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{summary.cohortName}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
                      <StatCell label="答题卡" value={String(summary.sheetCount)} />
                      <StatCell label="已阅完" value={String(summary.gradedCount)} />
                      <StatCell label="平均卷面" value={formatScore(summary.avgRaw)} />
                      <StatCell label="最高卷面" value={formatScore(summary.maxRaw)} />
                      <StatCell label="平均折合" value={formatScore(summary.avgConverted)} highlight />
                    </div>
                  </div>

                  {/* 分数段分布 */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500">折合分得分率分布（占折合满分比例）</p>
                    <div className="mt-2 flex h-8 items-end gap-2">
                      {summary.buckets.map((bucket) => {
                        const maxCount = Math.max(1, ...summary.buckets.map((item) => item.count))
                        return (
                          <div key={bucket.label} className="flex flex-1 flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-md bg-sky-700/80"
                              style={{ height: `${Math.max(6, (bucket.count / maxCount) * 100)}%` }}
                              title={`${bucket.label}：${bucket.count} 人`}
                            />
                            <span className="text-[10px] text-slate-500">{bucket.label}（{bucket.count}）</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedExamId(expanded ? null : summary.examId)}
                    className="mt-3 text-xs font-semibold text-sky-800 hover:text-sky-600"
                  >
                    {expanded ? '收起题目得分率 ▲' : '展开题目得分率 ▼'}
                  </button>

                  {expanded && summary.questionStats.length > 0 && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs text-slate-500">
                          <tr>
                            <th className="px-3 py-2">题目</th>
                            <th className="px-3 py-2">知识模块</th>
                            <th className="px-3 py-2 text-right">平均得分</th>
                            <th className="px-3 py-2 text-right">平均得分率</th>
                            <th className="px-3 py-2 text-right">满分率</th>
                            <th className="px-3 py-2 text-right">零分率</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {summary.questionStats.map((stat) => (
                            <tr key={stat.questionId}>
                              <td className="px-3 py-2 text-slate-800">{stat.title}</td>
                              <td className="px-3 py-2 text-slate-500">{stat.topicTag}</td>
                              <td className="px-3 py-2 text-right">{formatScore(stat.avgScore)} / {formatScore(stat.maxScore)}</td>
                              <td className={`px-3 py-2 text-right font-semibold ${stat.avgRate < 0.5 ? 'text-rose-600' : stat.avgRate >= 0.75 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {formatPercent(stat.avgRate)}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-600">{formatPercent(stat.fullMarkRate)}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{formatPercent(stat.zeroRate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              )
            })}

            {statistics && statistics.cohortTrends.length > 0 && (
              <article className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                <h3 className="text-sm font-semibold text-slate-800">期次趋势（已公布考试）</h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs text-slate-500">
                      <tr>
                        <th className="px-3 py-2">期次</th>
                        <th className="px-3 py-2">考试</th>
                        <th className="px-3 py-2">考试时间</th>
                        <th className="px-3 py-2 text-right">已阅完</th>
                        <th className="px-3 py-2 text-right">平均折合分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statistics.cohortTrends.map((trend) => (
                        <tr key={trend.examId}>
                          <td className="px-3 py-2 text-slate-700">{trend.cohortName}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{trend.examName}</td>
                          <td className="px-3 py-2 text-slate-500">{trend.scheduledStart}</td>
                          <td className="px-3 py-2 text-right">{trend.gradedCount}</td>
                          <td className="px-3 py-2 text-right font-semibold text-sky-950">{formatScore(trend.avgConverted)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            )}
          </div>
        )}
      </div>
    </EducationShell>
  )
}

function StatCell({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${highlight ? 'bg-sky-50' : 'bg-slate-50'}`}>
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-sky-950' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
