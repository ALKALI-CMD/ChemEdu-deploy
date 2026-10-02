import type { OrganizationChangeLog } from '@/objects/admin/OrganizationChangeLog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'

type OrganizationChangeLogPanelProps = {
  logs: OrganizationChangeLog[]
}

export default function OrganizationChangeLogPanel({ logs }: OrganizationChangeLogPanelProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>组织变更日志</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        {logs.length === 0 ? (
          <p>当前没有组织变更记录。</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-950">{log.action}</p>
                <span className="text-xs text-slate-500">{log.createdAt}</span>
              </div>
              <p className="mt-1">{log.actorName} / {log.targetType} / {log.targetId}</p>
              <p className="mt-2 text-slate-500">{log.detail}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
