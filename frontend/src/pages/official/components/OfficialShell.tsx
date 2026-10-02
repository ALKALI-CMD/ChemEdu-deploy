// 文件说明：清北营官网公共外壳，极简风格：白底、细分割线、单色排版，页脚保留免责声明。
import { Link, NavLink } from 'react-router-dom'
import { FlaskConical, Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { brand } from '@/content/siteContent'

const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/programs', label: '课程体系' },
  { to: '/faculty', label: '师资团队' },
  { to: '/research', label: '教研成果' },
  { to: '/results', label: '学员成果' },
  { to: '/legal', label: '法律条款' },
]

export default function OfficialShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <FlaskConical className="h-5 w-5 text-slate-900" />
            <span className="text-base font-semibold tracking-tight text-slate-950">{brand.name}</span>
            <span className="hidden text-sm text-slate-400 sm:inline">化学竞赛训练与评定</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-sm transition ${isActive ? 'font-medium text-slate-950' : 'text-slate-500 hover:text-slate-900'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link to="/enroll" className="text-sm font-medium text-slate-900 transition hover:text-slate-500">
              报名咨询
            </Link>
            <Link
              to="/discover"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              进入平台
            </Link>
          </div>

          <button
            type="button"
            aria-label="打开菜单"
            className="p-1 text-slate-600 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-2 text-sm ${isActive ? 'font-medium text-slate-950' : 'text-slate-500'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
                <Link to="/enroll" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-900">
                  报名咨询
                </Link>
                <Link
                  to="/discover"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                >
                  进入平台
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-slate-950">{brand.fullName}</p>
              <p className="text-sm text-slate-500">{brand.tagline}</p>
              <p className="text-sm text-slate-400">{brand.location}</p>
              <p className="text-sm text-slate-400">咨询时间：{brand.workTime}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-sm text-slate-500">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
              <Link to="/enroll" className="hover:text-slate-900">
                报名咨询
              </Link>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-relaxed text-slate-400">
            重要声明：{brand.disclaimerShort}
          </p>
          <p className="mt-3 text-xs text-slate-400">© {new Date().getFullYear()} {brand.fullName}</p>
        </div>
      </footer>
    </div>
  )
}
