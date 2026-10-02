import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'

type GovernanceDecisionHistoryProps = {
  discussion: DiscussionTopic
  relatedLogs: OperationLogItem[]
}

export default function GovernanceDecisionHistory({ discussion, relatedLogs }: GovernanceDecisionHistoryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">处理记录</p>
      <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
        <p>当前处理结果：{discussion.visibility === 'hidden' ? '已隐藏' : '正常显示'}</p>
        <p>线程状态：{discussion.threadState === 'locked' ? '已锁帖' : '开放回复'}</p>
        <p>置顶状态：{discussion.pinState === 'pinned' ? '已置顶' : '普通主题'}</p>
        {relatedLogs.length > 0 ? (
          <div className="rounded-2xl bg-slate-50 p-3">
            {relatedLogs.slice(0, 3).map((item) => (
              <p key={item.id} className="text-xs text-slate-500">
                {item.createdAt} / {item.action}
                {item.detail ? ` / ${item.detail}` : ''}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">当前还没有这条讨论的治理记录。</p>
        )}
      </div>
    </div>
  )
}
