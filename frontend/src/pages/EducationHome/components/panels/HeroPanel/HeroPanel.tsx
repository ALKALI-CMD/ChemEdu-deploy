import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Compass, GraduationCap, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'
import { UserRole } from '@/objects/auth/UserRole'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { courseDiscoveryText } from '../../../objects/courseDiscoveryConfig'

type HeroSectionProps = {
  dashboard: EducationDashboardResponse
}

function getQuickActions(dashboard: EducationDashboardResponse) {
  const role = dashboard.currentUser.role

  if (role === UserRole.Student) {
    return [
      { title: '进入学生中心', description: '继续学习、查看任务和成绩。', to: '/student', icon: GraduationCap },
      { title: '课程发现', description: '浏览课程列表，按分类、教师和价格筛选。', to: '/courses', icon: Compass },
      { title: '查看我的课程', description: '快速回到已报名课程和学习进度。', to: '/student/courses', icon: BookOpen },
      { title: '查看作业与测验', description: '集中处理待完成任务和最近反馈。', to: '/student/assignments', icon: TrendingUp },
    ]
  }

  if (role === UserRole.Teacher || role === UserRole.Assistant) {
    return [
      { title: '进入教师后台', description: '管理课程、作业、批改和讨论。', to: '/teacher', icon: BookOpen },
      { title: '课程管理', description: '新建课程并维护章节与课时。', to: '/teacher/courses', icon: Sparkles },
      { title: '发布学习任务', description: '为课程发布作业和测验。', to: '/teacher/publishing', icon: TrendingUp },
      { title: '课程发现', description: '查看前台课程列表与学生可见效果。', to: '/courses', icon: Compass },
    ]
  }

  return [
    { title: '平台总览', description: '查看平台级统计和最近治理记录。', to: '/admin', icon: ShieldCheck },
    { title: '课程审核', description: '集中处理待审核课程和批注记录。', to: '/admin/audits', icon: BookOpen },
    { title: '用户权限', description: '按角色分组管理平台访问权限。', to: '/admin/users', icon: GraduationCap },
    { title: '课程发现', description: '查看课程前台展示和发布效果。', to: '/courses', icon: Compass },
  ]
}

function uniqueNormalizedValues(values: string[]) {
  const valueMap = new Map<string, string>()
  values.forEach((value) => {
    const normalizedValue = value.trim()
    const key = normalizedValue.toLowerCase()
    if (normalizedValue && !valueMap.has(key)) {
      valueMap.set(key, normalizedValue)
    }
  })
  return Array.from(valueMap.values())
}

export default function HeroSection({ dashboard }: HeroSectionProps) {
  const quickActions = getQuickActions(dashboard)
  const publishedCourses = dashboard.courses.filter((course) => course.status === CourseStatus.Published)
  const freeCourses = publishedCourses.filter((course) => Number(course.price) === 0)
  const paidCourses = publishedCourses.filter((course) => Number(course.price) > 0)
  const hottestCourse = [...publishedCourses].sort((left, right) => right.enrolledCount - left.enrolledCount)[0]
  const topCategories = uniqueNormalizedValues(publishedCourses.map((course) => courseDiscoveryText(course.category))).slice(0, 4)

  return (
    <Card className="overflow-hidden border-slate-200 bg-[radial-gradient(circle_at_top_left,#eff6ff_0%,#dbeafe_28%,#f8fafc_60%,#ffffff_100%)] text-slate-900 shadow-xl shadow-sky-100/60">
      <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-sky-200 bg-white text-sky-900 hover:bg-white">入口导航</Badge>
            <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
              当前身份：{courseDiscoveryText(dashboard.currentUser.name)}
            </Badge>
          </div>

          <div className="space-y-3">
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">选择要进入的功能</h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              首页只保留角色相关入口和关键统计；课程发现、作业、测验、批改、治理等内容分别进入各自页面处理。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900">
              <p className="text-sm text-slate-500">已发布课程</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{publishedCourses.length}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-slate-900">
              <p className="text-sm text-slate-500">免费课程</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{freeCourses.length}</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-slate-900">
              <p className="text-sm text-slate-500">付费课程</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{paidCourses.length}</p>
            </div>
            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-slate-900">
              <p className="text-sm text-slate-500">最热课程</p>
              <p className="mt-2 line-clamp-2 text-base font-semibold text-slate-950">
                {hottestCourse ? courseDiscoveryText(hottestCourse.title) : '暂无'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white">
              <Link to="/courses" className="!text-white">
                进入课程发现
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
              <Link to={hottestCourse ? `/course/${hottestCourse.id}` : '/courses'}>直接查看热门课程</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="border-slate-200 bg-white/90 text-slate-900 shadow-none">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-950">热门分类</p>
              <div className="flex flex-wrap gap-2">
                {topCategories.length > 0 ? (
                  topCategories.map((category) => (
                    <Badge key={category} className="rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {category}
                    </Badge>
                  ))
                ) : (
                  <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
                    暂无分类
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {quickActions.map(({ title, description, to, icon: Icon }) => (
              <Link
                key={title}
                to={to}
                className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-sky-300 hover:bg-sky-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2"
              >
                <Icon className="h-5 w-5 text-sky-700" />
                <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
