import { Link } from 'react-router-dom'
import { Button, Card, CardContent } from '@/components/ui/UiComponents'

type AdminOverviewHighlightsProps = {
  pendingAuditCount: number
  pendingGovernanceCount: number
  adminCount: number
}

export default function AdminOverviewHighlights({
  pendingAuditCount,
  pendingGovernanceCount,
  adminCount,
}: AdminOverviewHighlightsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">只保留治理入口</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
              <Link to="/admin/audits">进入课程审核</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
              <Link to="/admin/users">进入用户权限</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
              <Link to="/admin/governance">进入内容治理</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">当前治理重点</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">待审核课程</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingAuditCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">待治理讨论内容</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingGovernanceCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">管理员账号数</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{adminCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
