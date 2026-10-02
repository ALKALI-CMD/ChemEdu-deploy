import { Card, CardContent } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { zh } from '@/lib/localization'
import { formatMoney } from '../functions/businessPanelModel'

type BusinessMetricGridProps = {
  businessDashboard: EducationDashboardResponse['businessDashboard']
}

export default function BusinessMetricGrid({ businessDashboard }: BusinessMetricGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="课程转化" value={zh(businessDashboard.courseConversionRate)} detail={`${businessDashboard.enrollmentCount} 条报名`} />
      <MetricCard title="活跃学习" value={String(businessDashboard.activeLearnerCount)} detail={`任务完成 ${zh(businessDashboard.taskCompletionRate)}`} />
      <MetricCard title="经营收入" value={formatMoney(businessDashboard.revenue)} detail={`退款 ${formatMoney(businessDashboard.refundAmount)}`} />
      <MetricCard title="讨论活跃" value={String(businessDashboard.discussionActivityScore)} detail={`${businessDashboard.invoicePendingCount} 张发票待处理`} />
    </div>
  )
}

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  )
}
