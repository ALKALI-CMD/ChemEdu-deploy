import { Card, CardContent, Input } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import { categoryLabel, type NotificationReadFilter } from '../functions/notificationPanelModel'

type NotificationFilterBarProps = {
  unreadCount: number
  keyword: string
  category: string
  readFilter: NotificationReadFilter
  courseId: string
  categories: string[]
  courses: Course[]
  onKeywordChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onReadFilterChange: (value: NotificationReadFilter) => void
  onCourseIdChange: (value: string) => void
}

export default function NotificationFilterBar({
  unreadCount,
  keyword,
  category,
  readFilter,
  courseId,
  categories,
  courses,
  onKeywordChange,
  onCategoryChange,
  onReadFilterChange,
  onCourseIdChange,
}: NotificationFilterBarProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">未读通知</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{unreadCount}</p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-white shadow-sm lg:col-span-3">
        <CardContent className="grid gap-3 p-5 md:grid-cols-4">
          <Input placeholder="搜索消息、公告或提醒" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>{item === 'all' ? '全部分类' : categoryLabel[item] ?? item}</option>
            ))}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={readFilter} onChange={(event) => onReadFilterChange(event.target.value as NotificationReadFilter)}>
            <option value="all">全部状态</option>
            <option value="unread">未读</option>
            <option value="read">已读</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={courseId} onChange={(event) => onCourseIdChange(event.target.value)}>
            <option value="all">全部课程</option>
            {courses.map((course) => (
              <option key={course.id} value={String(course.id)}>{String(course.title)}</option>
            ))}
          </select>
        </CardContent>
      </Card>
    </div>
  )
}
