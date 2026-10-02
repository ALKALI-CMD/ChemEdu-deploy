import { useState } from 'react'
import { Link } from 'react-router-dom'
import EducationPageGuard from '@/components/EducationPageGuard'
import EducationShell from '@/components/EducationShell'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui/UiComponents'

type SearchType = 'all' | 'course' | 'discussion' | 'assignment'

export default function SearchCenter() {
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState<SearchType>('all')
  const [courseId, setCourseId] = useState('all')

  return (
    <EducationPageGuard title="全局搜索" description="搜索课程、讨论和作业内容。">
      {(dashboard) => {
        const courseMap = new Map(dashboard.courses.map((course) => [String(course.id), String(course.title)]))
        const query = keyword.trim().toLowerCase()
        const results = (() => {
          const items: Array<{ id: string; type: Exclude<SearchType, 'all'>; title: string; subtitle: string; body: string; courseId?: string; url: string }> = []
          if (type === 'all' || type === 'course') {
            dashboard.courses.forEach((course) => {
              items.push({
                id: String(course.id),
                type: 'course',
                title: String(course.title),
                subtitle: [course.category, course.grade, course.semesterLabel].filter(Boolean).join(' / '),
                body: `${course.subtitle} ${course.description} ${course.tags.join(' ')}`,
                courseId: String(course.id),
                url: `/courses/${course.id}`,
              })
            })
          }
          if (type === 'all' || type === 'discussion') {
            dashboard.discussions.forEach((discussion) => {
              items.push({
                id: String(discussion.id),
                type: 'discussion',
                title: String(discussion.title),
                subtitle: `${courseMap.get(String(discussion.courseId)) ?? discussion.courseId} / ${discussion.resolved ? '已解决' : '未解决'} / 热度 ${discussion.heatScore}`,
                body: `${discussion.content} ${discussion.replies.map((reply) => reply.content).join(' ')} ${discussion.teacherHighlights.map((item) => item.content).join(' ')}`,
                courseId: String(discussion.courseId),
                url: `/courses/${discussion.courseId}?tab=discussion`,
              })
            })
          }
          if (type === 'all' || type === 'assignment') {
            dashboard.assignments.forEach((assignment) => {
              items.push({
                id: String(assignment.id),
                type: 'assignment',
                title: String(assignment.title),
                subtitle: `${courseMap.get(String(assignment.courseId)) ?? assignment.courseId} / ${assignment.submissionStatus} / ${assignment.deadline}`,
                body: `${assignment.description} ${assignment.feedback ?? ''} ${assignment.submissionContent ?? ''}`,
                courseId: String(assignment.courseId),
                url: `/student/assignments?assignment=${assignment.id}`,
              })
            })
          }
          return items.filter((item) => {
            if (courseId !== 'all' && item.courseId !== courseId) return false
            if (!query) return true
            return `${item.title} ${item.subtitle} ${item.body}`.toLowerCase().includes(query)
          })
        })()

        return (
          <EducationShell eyebrow="全局搜索" title="全局搜索" description="跨课程、讨论区和作业记录快速定位内容。">
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_180px_220px]">
                  <Input autoFocus placeholder="输入关键词搜索课程、讨论或作业" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
                  <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(event) => setType(event.target.value as SearchType)}>
                    <option value="all">全部类型</option>
                    <option value="course">课程</option>
                    <option value="discussion">讨论</option>
                    <option value="assignment">作业</option>
                  </select>
                  <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                    <option value="all">全部课程</option>
                    {dashboard.courses.map((course) => (
                      <option key={course.id} value={String(course.id)}>{String(course.title)}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>搜索结果 {results.length}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.length === 0 ? (
                    <p className="text-sm text-slate-500">没有匹配结果。</p>
                  ) : (
                    results.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">{item.title}</p>
                              <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                                {item.type === 'course' ? '课程' : item.type === 'discussion' ? '讨论' : '作业'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{item.body}</p>
                          </div>
                          <Button asChild size="sm" className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white">
                            <Link className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white" to={item.url}>打开</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </EducationShell>
        )
      }}
    </EducationPageGuard>
  )
}
