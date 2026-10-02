import { Card, CardContent } from '@/components/ui/UiComponents'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'

export default function AdminOperationLogPanel({ operationLogs }: { operationLogs: OperationLogItem[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">最近操作记录</p>
        </div>
        <div className="mt-5 space-y-3">
          {operationLogs.length > 0 ? (
            operationLogs.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-950">
                  {item.actor} / {item.action}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.target}</p>
                {item.detail ? <p className="mt-1 text-sm text-slate-500">{item.detail}</p> : null}
                <p className="mt-2 text-xs text-slate-500">{item.createdAt}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              当前会话还没有新的治理操作记录。
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
