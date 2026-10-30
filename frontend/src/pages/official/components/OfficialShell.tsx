// 文件说明：清北营官网公共外壳，极简风格：白底、细分割线、单色排版。
import { Link, NavLink } from 'react-router-dom'
import { FlaskConical, Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import PreferenceButton from '@/components/education-shell/PreferenceButton'
import { brand } from '@/content/siteContent'

const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/programs', label: '课程体系' },
]

export default function OfficialShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="official-shell flex min-h-screen flex-col">
      <header className="official-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <FlaskConical className="h-5 w-5 text-slate-900" />
            <span className="text-base font-semibold tracking-tight text-slate-950">{brand.name}</span>
            <span className="hidden text-sm text-slate-400 sm:inline">化学竞赛团队</span>
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

          <div className="flex items-center gap-3"><PreferenceButton /><button
            type="button"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            className="p-1 text-slate-600 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu className="h-5 w-5" />
          </button></div>
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

      <a href="#official-main" className="skip-link">跳到主要内容</a>
      <main id="official-main" className="flex-1" tabIndex={-1}>{children}</main>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-slate-500 lg:px-6">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span>{brand.tagline}</span>
        </div>
      </footer>
    </div>
  )
}
