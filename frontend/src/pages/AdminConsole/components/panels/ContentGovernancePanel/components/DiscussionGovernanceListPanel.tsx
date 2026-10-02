import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/UiComponents'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import AdminEmptyState from '../../../AdminEmptyState'

type DiscussionGovernanceListPanelProps = {
  discussions: DiscussionTopic[]
}

export default function DiscussionGovernanceListPanel({ discussions }: DiscussionGovernanceListPanelProps) {
  return (
    <section className="rounded-3xl border border-sky-100 bg-sky-50/40 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-sky-700">讨论治理</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">管理讨论主题的显示、锁定和置顶</h3>
          <p className="mt-1 text-sm text-slate-500">这里只展示讨论主题。点击主题进入详情后再执行隐藏、锁帖或置顶。</p>
        </div>
        <Badge className="rounded-full bg-white text-sky-700 hover:bg-white">{discussions.length} 个主题</Badge>
      </div>

      <div className="space-y-3">
        {discussions.map((discussion) => (
          <Link
            key={discussion.id}
            to={`/admin/governance/discussions/${discussion.id}`}
            className="block rounded-2xl border border-sky-100 bg-white p-4 transition hover:border-sky-300 hover:bg-sky-50/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{discussion.title}</p>
                <p className="mt-1 text-sm text-slate-500">{discussion.author} / 回复 {discussion.replyCount} 条 / 最近更新 {discussion.lastReplyAt}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">{discussion.visibility === DiscussionVisibility.Hidden ? '已隐藏' : '显示中'}</span>
                {discussion.threadState === DiscussionThreadState.Locked ? <span className="rounded-full bg-slate-100 px-3 py-1">已锁帖</span> : null}
                {discussion.pinState === DiscussionPinState.Pinned ? <span className="rounded-full bg-slate-100 px-3 py-1">已置顶</span> : null}
              </div>
            </div>
          </Link>
        ))}
        {discussions.length === 0 ? <AdminEmptyState message="当前筛选条件下没有需要治理的讨论内容。" /> : null}
      </div>
    </section>
  )
}
