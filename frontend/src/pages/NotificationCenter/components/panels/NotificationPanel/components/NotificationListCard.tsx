import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import { buildCourseReadSummary, categoryLabel, type NotificationItem } from '../functions/notificationPanelModel'

type NotificationListCardProps = {
  notifications: NotificationItem[]
  courses: Course[]
  courseMap: Map<string, string>
  onMarkRead: (notificationId: string, read: boolean) => void
}

export default function NotificationListCard({
  notifications,
  courses,
  courseMap,
  onMarkRead,
}: NotificationListCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>通知列表</CardTitle>
          <p className="text-sm text-slate-500">点击查看后自动更新为已读。</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">当前筛选条件下没有通知。</p>
        ) : (
          notifications.map((item) => (
            <NotificationListItem
              key={item.id}
              item={item}
              courses={courses}
              courseMap={courseMap}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function NotificationListItem({
  item,
  courses,
  courseMap,
  onMarkRead,
}: {
  item: NotificationItem
  courses: Course[]
  courseMap: Map<string, string>
  onMarkRead: (notificationId: string, read: boolean) => void
}) {
  const readSummary = buildCourseReadSummary(item, courses)

  return (
    <div className={`rounded-2xl border p-4 ${item.read ? 'border-slate-200 bg-white' : 'border-sky-200 bg-sky-50/50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-950">{item.title}</p>
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{categoryLabel[item.category] ?? item.category}</Badge>
            {!item.read ? <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">未读</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{item.createdAt}{item.courseId ? ` / ${courseMap.get(String(item.courseId)) ?? item.courseId}` : ''}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{item.content}</p>
          {readSummary ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              课程阅读统计：应读 {readSummary.expectedCount} 人 / {readSummary.currentState}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.actionUrl ? (
            <Button size="sm" className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white" asChild>
              <Link
                className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white"
                to={item.actionUrl}
                onClick={() => {
                  if (!item.read) onMarkRead(item.id, true)
                }}
              >
                查看
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                if (!item.read) onMarkRead(item.id, true)
              }}
            >
              查看
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
