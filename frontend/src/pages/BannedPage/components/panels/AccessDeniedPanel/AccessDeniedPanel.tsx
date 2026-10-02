import { useEffect, useState } from 'react'
import { ShieldAlert, LogOut, Send, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { sendAPI } from '@/lib/apiClient'
import { createPlatformReportRequest } from '@/api/course/discussion/CreatePlatformReportAPIMessage'
import { useAuth } from '@/components/auth-context'
import { isBannedUser } from '@/components/auth-permissions'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Textarea } from '@/components/ui/UiComponents'
import { InlineNotice, type NoticeState, useAutoClearNotice } from '@/components/ExperienceState'
import { UserRole } from '@/objects/auth/UserRole'

function getRoleHome(role: UserRole): string {
  switch (role) {
    case UserRole.Student:
      return '/student'
    case UserRole.Admin:
      return '/admin'
    case UserRole.Analyst:
      return '/analyst'
    case UserRole.Teacher:
    case UserRole.Assistant:
      return '/teacher'
  }
}

export default function BannedPage() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const { refresh } = useEducationDashboard()
  const [appealOpen, setAppealOpen] = useState(false)
  const [appealText, setAppealText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)
  useAutoClearNotice(notice, setNotice)

  useEffect(() => {
    if (session?.user && !isBannedUser(session.user)) {
      navigate(getRoleHome(session.user.role), { replace: true })
    }
  }, [navigate, session])

  async function handleCheckStatus() {
    if (!session) {
      setNotice({ tone: 'error', title: '无法检查状态', message: '请重新登录后再检查账号状态。' })
      return
    }

    setChecking(true)
    try {
      await refresh()
      setNotice({ tone: 'info', title: '已重新检查', message: '如果申诉已通过，页面会自动返回系统首页。' })
    } catch (error) {
      setNotice({ tone: 'error', title: '检查失败', message: error instanceof Error ? error.message : '请稍后重试。' })
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmitAppeal() {
    if (!session) {
      setNotice({ tone: 'error', title: '无法提交申诉', message: '请重新登录后再提交申诉。' })
      return
    }
    if (appealText.trim().length < 10) {
      setNotice({ tone: 'error', title: '申诉内容过短', message: '请补充封禁原因说明、误封依据或联系方式，至少 10 个字。' })
      return
    }

    setSubmitting(true)
    try {
      await sendAPI(
        createPlatformReportRequest(
          session.sessionToken,
          'user',
          String(session.user.id),
          `封禁申诉：${String(session.user.email)}`,
          '账号封禁申诉',
          appealText.trim(),
        ),
      )
      setNotice({ tone: 'success', title: '申诉已提交', message: '管理员会在内容治理中处理这条申诉，请等待审核。' })
      setAppealText('')
      setAppealOpen(false)
    } catch (error) {
      setNotice({ tone: 'error', title: '申诉提交失败', message: error instanceof Error ? error.message : '请稍后重试。' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#f8fafc_0%,#eef6f8_48%,#f7f1e8_100%)] px-4 py-10 text-slate-950">
      <section className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-slate-950/10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">账号已被封禁</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          当前账号暂时无法访问课程、学习、讨论和管理功能。
        </p>
        <div className="mt-5">
          <InlineNotice notice={notice} />
        </div>
        {session?.user ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {String(session.user.name)} / {String(session.user.email)}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleCheckStatus()} disabled={checking}>
            <RefreshCw className="h-4 w-4" />
            {checking ? '检查中…' : '重新检查状态'}
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setAppealOpen(true)}>
            <Send className="h-4 w-4" />
            提交申诉
          </Button>
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </section>
      <Dialog open={appealOpen} onOpenChange={setAppealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提交账号封禁申诉</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-600">
              说明你认为账号被误封的原因、相关课程或讨论记录，以及管理员可以参考的信息。
            </p>
            <Textarea
              className="min-h-36"
              value={appealText}
              onChange={(event) => setAppealText(event.target.value)}
              placeholder="例如：我认为账号被误封，因为……请管理员核查最近的操作记录。"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAppealOpen(false)} disabled={submitting}>取消</Button>
            <Button type="button" onClick={handleSubmitAppeal} disabled={submitting} className="bg-slate-950 text-white hover:bg-slate-800">
              {submitting ? '提交中…' : '提交申诉'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
