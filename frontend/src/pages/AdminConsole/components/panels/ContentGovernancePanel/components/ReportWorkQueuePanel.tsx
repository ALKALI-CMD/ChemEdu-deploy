import { Badge, Button } from '@/components/ui/UiComponents'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import AdminEmptyState from '../../../AdminEmptyState'
import { isBanAppeal, isUserReport, reportTargetTypeLabel } from '../functions/contentGovernanceModel'

type ReportWorkQueuePanelProps = {
  reports: PlatformReport[]
  busyKey: string | null
  onResolveReport: (report: PlatformReport, status: string) => Promise<void>
}

export default function ReportWorkQueuePanel({
  reports,
  busyKey,
  onResolveReport,
}: ReportWorkQueuePanelProps) {
  return (
    <section className="rounded-3xl border border-rose-100 bg-rose-50/40 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-rose-700">举报工单</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">处理用户提交的举报和申诉</h3>
          <p className="mt-1 text-sm text-slate-500">这里只展示举报/申诉工单，不混入讨论主题列表。</p>
        </div>
        <Badge className="rounded-full bg-white text-rose-700 hover:bg-white">{reports.length} 个待处理</Badge>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-2xl border border-rose-100 bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{report.targetLabel}</p>
                  <Badge className="rounded-full bg-rose-50 text-rose-700 hover:bg-rose-50">{reportTargetTypeLabel[report.targetType]}</Badge>
                  <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{report.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  原因：{report.reason} / 举报人：{report.reporterName} / {report.createdAt}
                </p>
                {report.detail ? <p className="mt-2 text-sm leading-6 text-slate-700">{report.detail}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {!isBanAppeal(report) && !isUserReport(report) ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={busyKey === `report:${report.id}:reviewing`}
                    onClick={() => void onResolveReport(report, 'reviewing')}
                  >
                    处理中
                  </Button>
                ) : null}
                <Button
                  type="button"
                  className={isBanAppeal(report) || isUserReport(report) ? 'rounded-full bg-emerald-600 text-white hover:bg-emerald-700' : 'rounded-full bg-slate-950 text-white hover:bg-slate-800'}
                  disabled={busyKey === `report:${report.id}:resolved`}
                  onClick={() => void onResolveReport(report, 'resolved')}
                >
                  {isBanAppeal(report) ? '通过申诉' : isUserReport(report) ? '通过举报' : '通过'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={isBanAppeal(report) || isUserReport(report) ? 'rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'rounded-full border-slate-200'}
                  disabled={busyKey === `report:${report.id}:dismissed`}
                  onClick={() => void onResolveReport(report, 'dismissed')}
                >
                  {isBanAppeal(report) ? '驳回申诉' : isUserReport(report) ? '驳回举报' : '驳回'}
                </Button>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 ? <AdminEmptyState message="当前没有待处理举报或申诉。" /> : null}
      </div>
    </section>
  )
}
