import { Card, CardContent } from '@/components/ui/UiComponents'

type GovernanceStatsGridProps = {
  activeReportCount: number
  hiddenDiscussionCount: number
  lockedDiscussionCount: number
}

export default function GovernanceStatsGrid({
  activeReportCount,
  hiddenDiscussionCount,
  lockedDiscussionCount,
}: GovernanceStatsGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">举报待处理</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{activeReportCount}</p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">已隐藏讨论</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{hiddenDiscussionCount}</p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">已锁定讨论</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{lockedDiscussionCount}</p>
        </CardContent>
      </Card>
    </div>
  )
}
