import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/UiComponents'

type GovernanceOverviewLinksProps = {
  activeReportCount: number
  discussionCount: number
}

export default function GovernanceOverviewLinks({
  activeReportCount,
  discussionCount,
}: GovernanceOverviewLinksProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Link
        to="/admin/governance/reports"
        className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5 transition hover:border-rose-200 hover:bg-rose-50"
      >
        <p className="text-sm font-semibold text-rose-700">举报工单</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">处理举报和封禁申诉</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          进入独立页面查看举报目标、举报原因和申诉说明；举报可标记处理，申诉需明确通过或驳回。
        </p>
        <Badge className="mt-4 rounded-full bg-white text-rose-700 hover:bg-white">{activeReportCount} 个待处理</Badge>
      </Link>
      <Link
        to="/admin/governance/discussions"
        className="rounded-3xl border border-sky-100 bg-sky-50/60 p-5 transition hover:border-sky-200 hover:bg-sky-50"
      >
        <p className="text-sm font-semibold text-sky-700">讨论治理</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">管理讨论主题状态</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          进入独立页面筛选讨论主题，处理隐藏、锁帖和置顶，不混入举报工单。
        </p>
        <Badge className="mt-4 rounded-full bg-white text-sky-700 hover:bg-white">{discussionCount} 个主题</Badge>
      </Link>
    </section>
  )
}
