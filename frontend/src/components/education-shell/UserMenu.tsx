import { Link, useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/components/auth-context'
import { Avatar, AvatarFallback, Badge, Button } from '@/components/ui/UiComponents'
import { readAvatar } from '@/lib/local-media'
import { educationRoleLabel } from './navigation'

export default function UserMenu() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()

  if (!session) return null
  const initials = String(session.user.name).slice(0, 2).toUpperCase()
  const avatar = session.user.avatarUrl ?? readAvatar(String(session.user.id))

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="hidden items-center sm:flex">
        <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-50">
          当前身份：{String(session.user.name)} / {educationRoleLabel[session.user.role] ?? session.user.role}
        </Badge>
      </div>
      <Link
        to="/profile"
        aria-label="进入个人中心"
        className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <Avatar className="h-9 w-9 border border-slate-200 bg-slate-100">
          {avatar ? <img src={avatar} alt="用户头像" className="h-full w-full object-cover" /> : null}
          <AvatarFallback className="bg-slate-950 text-xs font-semibold text-white">
            {avatar ? null : initials || <UserRound className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <span className="hidden pr-2 text-sm font-medium text-slate-900 md:inline">个人中心</span>
      </Link>
      <Button
        variant="outline"
        className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
        onClick={async () => {
          await logout()
          navigate('/login', { replace: true })
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        退出登录
      </Button>
    </div>
  )
}
