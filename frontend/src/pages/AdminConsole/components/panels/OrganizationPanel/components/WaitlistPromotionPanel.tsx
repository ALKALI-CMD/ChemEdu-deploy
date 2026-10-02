import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { WaitlistEntry } from '@/objects/course/enrollment/WaitlistEntry'

type WaitlistPromotionPanelProps = {
  waitlistEntries: WaitlistEntry[]
  courseMap: Map<string, Course>
  userMap: Map<string, UserProfile>
  busyKey: string | null
  onPromoteWaitlistEntry: (courseId: Course['id'], userId: string) => void
}

export default function WaitlistPromotionPanel({
  waitlistEntries,
  courseMap,
  userMap,
  busyKey,
  onPromoteWaitlistEntry,
}: WaitlistPromotionPanelProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>候补名单</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        {waitlistEntries.length === 0 ? (
          <p>当前没有候补记录。</p>
        ) : (
          waitlistEntries.map((entry) => {
            const course = courseMap.get(String(entry.courseId))
            const user = userMap.get(String(entry.userId))
            const busy = busyKey === `org:waitlist:${entry.courseId}:${entry.userId}`

            return (
              <div key={`${entry.courseId}-${entry.userId}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{course?.title ?? entry.courseId}</p>
                    <p className="mt-1">{user?.name ?? entry.userId} / 第 {entry.position} 位 / {entry.queuedAt}</p>
                  </div>
                  <Button size="sm" disabled={busy} onClick={() => onPromoteWaitlistEntry(entry.courseId, String(entry.userId))}>
                    转为正式选课
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
