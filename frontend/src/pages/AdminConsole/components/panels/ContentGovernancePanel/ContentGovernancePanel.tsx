import { Link } from 'react-router-dom'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import { Button } from '@/components/ui/UiComponents'
import AdminPanelShell from '../../AdminPanelShell'
import type { OperationLogItem } from '../../../objects/adminConsoleConfig'
import DiscussionGovernanceListPanel from './components/DiscussionGovernanceListPanel'
import GovernanceDiscussionCard from './components/GovernanceDiscussionCard'
import GovernanceOverviewLinks from './components/GovernanceOverviewLinks'
import GovernanceStatsGrid from './components/GovernanceStatsGrid'
import GovernanceToolbar from './components/GovernanceToolbar'
import ReportWorkQueuePanel from './components/ReportWorkQueuePanel'
import { useContentGovernanceFilters } from './hooks/useContentGovernanceFilters'

type ContentGovernancePanelProps = {
  discussions: DiscussionTopic[]
  reports: PlatformReport[]
  view: 'overview' | 'reports' | 'discussions' | 'discussionDetail'
  detailDiscussionId?: string
  busyKey: string | null
  governanceLogs: OperationLogItem[]
  onModerateTopic: (
    topicId: DiscussionTopic['id'],
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
  ) => Promise<void>
  onResolveReport: (reportId: PlatformReport['id'], status: string, resolutionNote?: string) => Promise<void>
}

export default function ContentGovernancePanel({
  discussions,
  reports,
  view,
  detailDiscussionId,
  busyKey,
  governanceLogs,
  onModerateTopic,
  onResolveReport,
}: ContentGovernancePanelProps) {
  const { keyword, setKeyword, filter, setFilter, filteredDiscussions } = useContentGovernanceFilters(discussions)
  const detailDiscussion = detailDiscussionId ? discussions.find((discussion) => discussion.id === detailDiscussionId) : null
  const activeReports = reports.filter((report) => report.status === 'open' || report.status === 'reviewing')
  const hiddenDiscussionCount = discussions.filter((discussion) => discussion.visibility === DiscussionVisibility.Hidden).length
  const lockedDiscussionCount = discussions.filter((discussion) => discussion.threadState === DiscussionThreadState.Locked).length

  async function handleResolve(report: PlatformReport, status: string) {
    const note = window.prompt('填写处理备注（可留空）。')?.trim()
    await onResolveReport(report.id, status, note || undefined)
  }

  return (
    <AdminPanelShell
      title="内容治理"
      description="分区处理举报工单、讨论主题状态和治理记录。"
      headerExtras={view === 'discussions' ? <GovernanceToolbar keyword={keyword} setKeyword={setKeyword} filter={filter} setFilter={setFilter} /> : null}
    >
      {detailDiscussion ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">讨论治理详情</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">单个讨论主题处理</h3>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/admin/governance/discussions">返回讨论治理</Link>
            </Button>
          </div>
          <GovernanceDiscussionCard
            key={detailDiscussion.id}
            discussion={detailDiscussion}
            busyKey={busyKey}
            governanceLogs={governanceLogs}
            onModerateTopic={onModerateTopic}
          />
        </section>
      ) : (
        <div className="space-y-6">
          <GovernanceStatsGrid
            activeReportCount={activeReports.length}
            hiddenDiscussionCount={hiddenDiscussionCount}
            lockedDiscussionCount={lockedDiscussionCount}
          />

          {view === 'overview' ? (
            <GovernanceOverviewLinks activeReportCount={activeReports.length} discussionCount={discussions.length} />
          ) : null}

          {view === 'reports' ? (
            <ReportWorkQueuePanel reports={activeReports} busyKey={busyKey} onResolveReport={handleResolve} />
          ) : null}

          {view === 'discussions' ? (
            <DiscussionGovernanceListPanel discussions={filteredDiscussions} />
          ) : null}
        </div>
      )}
    </AdminPanelShell>
  )
}
