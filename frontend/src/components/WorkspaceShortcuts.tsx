import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, ClipboardCheck, LineChart } from 'lucide-react'

const shortcuts = {
  student: [
    { to: '/student/exams', title: '考试中心', detail: '考试安排 · 成绩与复核', icon: ClipboardCheck },
    { to: '/student/assignments', title: '学习待办', detail: '作业 · 提交与反馈', icon: BookOpen },
    { to: '/student/grades', title: '成绩记录', detail: '回顾每一步进展', icon: LineChart },
  ],
  teacher: [
    { to: '/teacher/grading', title: '阅卷工作台', detail: '答题卡 · 逐题评分', icon: ClipboardCheck },
    { to: '/teacher/gradebook', title: '成绩册', detail: '成绩汇总与复核', icon: LineChart },
    { to: '/teacher/courses', title: '课程管理', detail: '教学内容与学习进展', icon: BookOpen },
  ],
  admin: [
    { to: '/admin/users', title: '用户与权限', detail: '角色 · 账号管理', icon: BookOpen },
    { to: '/admin/audits', title: '待办审核', detail: '课程与教学内容', icon: ClipboardCheck },
    { to: '/analyst', title: '考试数据', detail: '成绩分布与训练表现', icon: LineChart },
  ],
}
export default function WorkspaceShortcuts({ role }: { role: keyof typeof shortcuts }) {
  return <nav aria-label="快捷入口" className="grid gap-4 md:grid-cols-3">{shortcuts[role].map(({ icon: Icon, ...item }) => <Link key={item.to} to={item.to} className="shortcut-card"><div><Icon size={21} /><ArrowUpRight size={16} /></div><h2>{item.title}</h2><p>{item.detail}</p></Link>)}</nav>
}
