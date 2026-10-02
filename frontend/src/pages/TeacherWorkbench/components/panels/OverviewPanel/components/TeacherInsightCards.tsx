import { Link } from 'react-router-dom'
import { Button, Card, CardContent } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { buildLessonLink, text, type DrilldownKey } from '../functions/teacherOverviewModel'

type TeacherInsightCardsProps = {
  insights: EducationDashboardResponse['teachingInsights']
  activeDrilldown: DrilldownKey
  onDrilldownChange: (value: DrilldownKey) => void
}

export default function TeacherInsightCards({
  insights,
  activeDrilldown,
  onDrilldownChange,
}: TeacherInsightCardsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">待干预名单</p>
          </div>
          <Button type="button" variant={activeDrilldown === 'risk' ? 'default' : 'outline'} className="rounded-full" onClick={() => onDrilldownChange('risk')}>
            查看完整名单
          </Button>
          <div className="space-y-3">
            {insights.atRiskStudents.slice(0, 5).map((student) => (
              <Link
                key={`${student.courseId}-${student.userId}`}
                to={`/course/${student.courseId}/manage`}
                className="block rounded-2xl border border-rose-100 bg-rose-50 p-4 transition hover:border-rose-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{text(student.studentName)}</p>
                    <p className="text-sm text-slate-500">{text(student.courseTitle)}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-600">
                    进度 {student.completionRate}%
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">待作业 {student.pendingAssignmentCount}</span>
                  <span className="rounded-full bg-white px-3 py-1">待测验 {student.pendingQuizCount}</span>
                  <span className="rounded-full bg-white px-3 py-1">均分 {student.averageScore}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{student.riskReasons.join('、')}</p>
              </Link>
            ))}
            {insights.atRiskStudents.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                当前没有需要优先干预的学生，整体学习节奏比较稳定。
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">课时卡点</p>
          </div>
          <Button type="button" variant={activeDrilldown === 'bottleneck' ? 'default' : 'outline'} className="rounded-full" onClick={() => onDrilldownChange('bottleneck')}>
            查看卡点明细
          </Button>
          <div className="space-y-3">
            {insights.lessonBottlenecks.slice(0, 4).map((lesson) => (
              <Link
                key={lesson.lessonId}
                to={buildLessonLink(lesson.courseId, lesson.lessonId)}
                className="block rounded-2xl border border-amber-100 bg-amber-50 p-4 transition hover:border-amber-200 hover:shadow-sm"
              >
                <p className="font-medium text-slate-950">{text(lesson.lessonTitle)}</p>
                <p className="text-sm text-slate-500">
                  {text(lesson.courseTitle)} / {text(lesson.moduleTitle)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">完成率 {lesson.completionRate}%</span>
                  <span className="rounded-full bg-white px-3 py-1">平均学习 {lesson.averageStudyMinutes} 分钟</span>
                  <span className="rounded-full bg-white px-3 py-1">要求 {lesson.requiredStudyMinutes} 分钟</span>
                </div>
              </Link>
            ))}
            {insights.lessonBottlenecks.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                暂时没有明显卡点课时，整体完成率比较稳定。
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">高错误率题目</p>
          </div>
          <Button type="button" variant={activeDrilldown === 'hotspot' ? 'default' : 'outline'} className="rounded-full" onClick={() => onDrilldownChange('hotspot')}>
            查看热点题目
          </Button>
          <div className="space-y-3">
            {insights.questionHotspots.slice(0, 4).map((question) => (
              <Link
                key={`${question.quizTitle}-${question.questionId}`}
                to="/teacher/gradebook"
                className="block rounded-2xl border border-sky-100 bg-sky-50 p-4 transition hover:border-sky-200 hover:shadow-sm"
              >
                <p className="font-medium text-slate-950">{text(question.questionPrompt)}</p>
                <p className="text-sm text-slate-500">
                  {text(question.courseTitle)} / {text(question.quizTitle)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">{text(question.questionType)}</span>
                  <span className="rounded-full bg-white px-3 py-1">错误率 {question.wrongRate}%</span>
                  <span className="rounded-full bg-white px-3 py-1">
                    {question.wrongCount} / {question.attemptCount}
                  </span>
                </div>
              </Link>
            ))}
            {insights.questionHotspots.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                当前还没有足够的测验提交记录来生成题目热点。
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
