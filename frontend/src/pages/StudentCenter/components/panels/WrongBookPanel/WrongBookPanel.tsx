import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import MasteryRadarChart from './components/MasteryRadarChart'
import type { WrongQuestionItem } from '../../../hooks/useStudentCenterModel'

const WRONGBOOK_STATUS_STORAGE_KEY = 'student-wrongbook-status'

const questionTypeLabel: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  subjective: '主观题',
}

function formatAnswers(values: string[]) {
  return values.length > 0 ? values.join('、') : '未作答'
}

export default function WrongBookPanel({ items }: { items: WrongQuestionItem[] }) {
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [resolvedMap, setResolvedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = window.localStorage.getItem(WRONGBOOK_STATUS_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    } catch {
      return {}
    }
  })

  function updateResolvedStatus(questionId: string, resolved: boolean) {
    setResolvedMap((current) => {
      const next = { ...current, [questionId]: resolved }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(WRONGBOOK_STATUS_STORAGE_KEY, JSON.stringify(next))
      }
      return next
    })
  }

  const courseOptions = useMemo(
    () => Array.from(new Map(items.map((item) => [item.courseId, item.courseTitle])).entries()),
    [items],
  )
  const typeOptions = useMemo(() => Array.from(new Set(items.map((item) => item.questionType))), [items])

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (courseFilter === 'all' || item.courseId === courseFilter) &&
          (typeFilter === 'all' || item.questionType === typeFilter) &&
          (statusFilter === 'all' ||
            (statusFilter === 'resolved' ? Boolean(resolvedMap[item.id]) : !resolvedMap[item.id])),
      ),
    [courseFilter, items, resolvedMap, statusFilter, typeFilter],
  )

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">错题本</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MasteryRadarChart items={items} resolvedMap={resolvedMap} questionTypeLabel={questionTypeLabel} />

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
          >
            <option value="all">全部课程</option>
            {courseOptions.map(([courseId, courseTitle]) => (
              <option key={courseId} value={courseId}>
                {courseTitle}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">全部题型</option>
            {typeOptions.map((questionType) => (
              <option key={questionType} value={questionType}>
                {questionTypeLabel[questionType] ?? questionType}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="pending">待巩固</option>
            <option value="resolved">已掌握</option>
          </select>
          <div className="flex items-center rounded-lg bg-slate-50 px-3 text-sm text-slate-600">共 {filteredItems.length} 题</div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyIllustrationState
            kind="wrongbook"
            title={items.length === 0 ? '暂无错题记录' : '暂无匹配错题'}
            message="暂无错题。"
          />
        ) : null}

        {filteredItems.map((item) => (
          <div key={item.id} className="motion-card animate-fade-up rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">
                  {item.courseTitle} / {item.quizTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">{questionTypeLabel[item.questionType] ?? item.questionType}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    resolvedMap[item.id] ? 'status-feedback bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {resolvedMap[item.id] ? '已掌握' : '待巩固'}
                </span>
                <Button asChild type="button" variant="outline" className="rounded-full">
                  <Link to={`/student/quizzes?quiz=${encodeURIComponent(item.quizId)}&question=${encodeURIComponent(item.questionId)}`}>
                    按题重练
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => updateResolvedStatus(item.id, !resolvedMap[item.id])}
                >
                  {resolvedMap[item.id] ? '恢复为待巩固' : '标记为已掌握'}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-base font-semibold text-slate-950">{item.prompt}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">你的答案</p>
                <p className="mt-2 text-sm text-slate-700">{formatAnswers(item.submittedAnswers)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">正确答案</p>
                <p className="mt-2 text-sm text-slate-700">{formatAnswers(item.correctAnswers)}</p>
              </div>
            </div>
            {item.explanation ? (
              <div className="mt-3 rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">题目解析</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.explanation}</p>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
