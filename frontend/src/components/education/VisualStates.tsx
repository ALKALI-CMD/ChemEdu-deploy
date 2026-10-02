import { useId, type ReactNode } from 'react'
import { BookOpen, CheckCircle2, EyeOff, Flame, LockKeyhole, MessageCircle, Pin, ShieldCheck } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/UiComponents'
import { readCourseCover } from '@/lib/local-media'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'

type EmptyIllustrationKind = 'courses' | 'wrongbook' | 'discussion' | 'audit'

type EmptyIllustrationStateProps = {
  kind: EmptyIllustrationKind
  title: string
  message: string
  action?: ReactNode
}

type CourseCategoryCoverProps = {
  category: string | string
  title?: string
  className?: string
  showText?: boolean
}

type CourseCoverCaptionMode = 'overlay' | 'below'

type LearningPerformanceHeatmapProps = {
  gradeTrend: Array<{ id: string; score: number; timestamp: string; label: string }>
  courseProgress: CourseProgressStats[]
}

type AuditProcessTimelineProps = {
  auditTrail: Array<{ id: string; action: string; detail: string; actorName: string; createdAt: string }>
}

const categoryThemes = [
  {
    match: ['编程', '程序', '前端', '后端', '代码', 'python', 'java', 'web'],
    from: '#0f172a',
    mid: '#2563eb',
    to: '#22d3ee',
    icon: 'code',
  },
  {
    match: ['数学', '算法', '统计', '数据', '物理'],
    from: '#164e63',
    mid: '#0891b2',
    to: '#a3e635',
    icon: 'math',
  },
  {
    match: ['设计', '视觉', '产品', 'ui', '交互'],
    from: '#831843',
    mid: '#db2777',
    to: '#f59e0b',
    icon: 'design',
  },
  {
    match: ['英语', '语言', '写作', '阅读'],
    from: '#14532d',
    mid: '#16a34a',
    to: '#facc15',
    icon: 'language',
  },
]

function pickCategoryTheme(category: string) {
  const normalized = category.toLowerCase()
  return categoryThemes.find((theme) => theme.match.some((keyword) => normalized.includes(keyword.toLowerCase()))) ?? categoryThemes[0]
}

function EmptyIllustration({ kind }: { kind: EmptyIllustrationKind }) {
  const accent = kind === 'wrongbook' ? '#f59e0b' : kind === 'discussion' ? '#0ea5e9' : kind === 'audit' ? '#10b981' : '#6366f1'

  return (
    <svg className="h-24 w-32" viewBox="0 0 160 116" role="img" aria-hidden="true">
      <rect x="18" y="30" width="124" height="70" rx="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M34 52h46M34 68h72M34 84h38" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="116" cy="58" r="18" fill={accent} opacity="0.16" />
      {kind === 'wrongbook' ? (
        <path d="M107 58l7 7 15-17" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      ) : kind === 'discussion' ? (
        <path d="M102 50h28v18h-15l-8 8v-8h-5z" fill={accent} opacity="0.9" />
      ) : kind === 'audit' ? (
        <path d="M116 42l18 8v14c0 12-8 21-18 26-10-5-18-14-18-26V50z" fill={accent} opacity="0.9" />
      ) : (
        <path d="M103 48h26v34l-13-7-13 7z" fill={accent} opacity="0.9" />
      )}
      <circle cx="42" cy="22" r="8" fill={accent} opacity="0.18" />
      <circle cx="130" cy="24" r="5" fill="#94a3b8" opacity="0.35" />
    </svg>
  )
}

export function EmptyIllustrationState({ kind, title, message, action }: EmptyIllustrationStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <EmptyIllustration kind={kind} />
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{message}</p>
        </div>
        {action}
      </div>
    </div>
  )
}

export function CourseCategoryCover({ category, title, className = '', showText = true }: CourseCategoryCoverProps) {
  const categoryText = String(category)
  const theme = pickCategoryTheme(categoryText)
  const titleText = title ? String(title).slice(0, 18) : categoryText
  const id = useId().replaceAll(':', '')
  const gradientId = `cover-${id}`
  const patternId = `pattern-${id}`
  const sizeClassName = className || 'h-28'

  return (
    <div className={`relative overflow-hidden ${sizeClassName}`}>
      <svg className="h-full w-full" viewBox="0 0 420 132" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${categoryText}课程封面`}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={theme.from} />
            <stop offset="52%" stopColor={theme.mid} />
            <stop offset="100%" stopColor={theme.to} />
          </linearGradient>
          <pattern id={patternId} width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M0 52L52 0M-12 12L12-12M40 64L64 40" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="420" height="132" fill={`url(#${gradientId})`} />
        <rect width="420" height="132" fill={`url(#${patternId})`} opacity="0.9" />
        <circle cx="336" cy="46" r="54" fill="rgba(255,255,255,0.16)" />
        <circle cx="376" cy="96" r="34" fill="rgba(255,255,255,0.12)" />
        {theme.icon === 'math' ? (
          <g stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.84">
            <path d="M278 78h74M315 41v74" />
            <path d="M92 88c38-78 74-78 112 0" fill="none" />
          </g>
        ) : theme.icon === 'design' ? (
          <g fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.84">
            <path d="M292 42l48 48M340 42l-48 48" />
            <rect x="82" y="38" width="92" height="52" rx="16" />
          </g>
        ) : theme.icon === 'language' ? (
          <g fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.84">
            <path d="M82 88V42h52c20 0 32 9 32 23s-12 23-32 23zM234 90l34-48 34 48M250 70h36" />
          </g>
        ) : (
          <g fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.84">
            <path d="M112 44L78 66l34 22M180 44l34 22-34 22M156 36l-26 60" />
          </g>
        )}
      </svg>
      <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-white shadow-sm ring-1 ring-white/30">
        <BookOpen className="h-5 w-5" />
      </div>
      {showText ? (
        <div className="absolute inset-x-5 top-16 text-white">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">{categoryText}</p>
          <p className="mt-1 max-w-[11rem] text-lg font-semibold leading-tight">{titleText}</p>
        </div>
      ) : null}
    </div>
  )
}

function heatColor(value: number) {
  if (value >= 90) return '#059669'
  if (value >= 78) return '#0ea5e9'
  if (value >= 60) return '#f59e0b'
  if (value > 0) return '#f43f5e'
  return '#e2e8f0'
}

export function LearningPerformanceHeatmap({ gradeTrend, courseProgress }: LearningPerformanceHeatmapProps) {
  const trendPoints = gradeTrend.slice(-14)
  const fallbackPoints = courseProgress.slice(0, 14).map((entry, index) => ({
    id: String(entry.courseId),
    score: Number(entry.completionRate),
    timestamp: `课程 ${index + 1}`,
    label: String(entry.courseId),
  }))
  const points = (trendPoints.length > 0 ? trendPoints : fallbackPoints).slice(-14)

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">最近学习表现热力图</CardTitle>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <EmptyIllustrationState kind="wrongbook" title="暂无学习表现" message="完成作业、测验或课时后，这里会生成最近表现热力格。" />
        ) : (
          <div className="overflow-x-auto">
            <svg className="min-w-[620px]" viewBox="0 0 680 150" role="img" aria-label="最近学习表现热力图">
              <text x="0" y="18" className="fill-slate-500 text-[12px]">日期 / 任务</text>
              <text x="0" y="92" className="fill-slate-500 text-[12px]">表现</text>
              {points.map((point, index) => {
                const x = 86 + index * 40
                return (
                  <g key={point.id}>
                    <rect x={x} y="46" width="28" height="28" rx="7" fill={heatColor(point.score)} />
                    <text x={x + 14} y="100" textAnchor="middle" className="fill-slate-950 text-[11px] font-semibold">
                      {Math.round(point.score)}
                    </text>
                    <text x={x + 14} y="126" textAnchor="middle" className="fill-slate-500 text-[10px]">
                      {point.timestamp.slice(5, 10) || point.timestamp.slice(0, 4)}
                    </text>
                  </g>
                )
              })}
              <g transform="translate(502 12)">
                <rect x="0" y="0" width="14" height="14" rx="4" fill="#f43f5e" />
                <text x="20" y="12" className="fill-slate-500 text-[11px]">待巩固</text>
                <rect x="78" y="0" width="14" height="14" rx="4" fill="#f59e0b" />
                <text x="98" y="12" className="fill-slate-500 text-[11px]">稳定</text>
                <rect x="142" y="0" width="14" height="14" rx="4" fill="#059669" />
                <text x="162" y="12" className="fill-slate-500 text-[11px]">优秀</text>
              </g>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AuditProcessTimeline({ auditTrail }: AuditProcessTimelineProps) {
  const recent = auditTrail.slice(0, 5)
  const steps = recent.length > 0
    ? recent
    : [
        { id: 'course-review', action: '课程审核', detail: '教师提交课程后进入审核队列', actorName: '管理员', createdAt: '待触发' },
        { id: 'content-governance', action: '内容治理', detail: '讨论举报、隐藏和恢复形成审计记录', actorName: '教师/管理员', createdAt: '待触发' },
        { id: 'permission-change', action: '权限变更', detail: '角色授权和资源级权限变更进入链路', actorName: '管理员', createdAt: '待触发' },
      ]

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <ShieldCheck className="h-5 w-5 text-slate-600" />
          权限 / 审核流程时间线
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg className="min-w-[680px]" viewBox="0 0 760 170" role="img" aria-label="权限审核流程时间线">
            <line x1="64" x2="696" y1="72" y2="72" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            {steps.map((step, index) => {
              const x = 64 + index * (632 / Math.max(1, steps.length - 1))
              return (
                <g key={step.id}>
                  <circle cx={x} cy="72" r="18" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                  <path d={`M${x - 7} 72l5 5 11-13`} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <text x={x} y="118" textAnchor="middle" className="fill-slate-950 text-[13px] font-semibold">
                    {step.action}
                  </text>
                  <text x={x} y="138" textAnchor="middle" className="fill-slate-500 text-[11px]">
                    {step.actorName}
                  </text>
                  <text x={x} y="154" textAnchor="middle" className="fill-slate-400 text-[10px]">
                    {step.createdAt.slice(0, 10)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

export function DiscussionStatusBadges({
  pinned,
  locked,
  hidden,
  resolved,
}: {
  pinned: boolean
  locked: boolean
  hidden: boolean
  resolved?: boolean
}) {
  return (
    <>
      {resolved === undefined ? null : resolved ? (
        <Badge className="gap-1 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          已解决
        </Badge>
      ) : (
        <Badge className="gap-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
          <MessageCircle className="h-3.5 w-3.5" />
          待解决
        </Badge>
      )}
      {pinned ? (
        <Badge className="gap-1 rounded-full bg-slate-950 text-white hover:bg-slate-950">
          <Pin className="h-3.5 w-3.5" />
          已置顶
        </Badge>
      ) : null}
      {locked ? (
        <Badge className="gap-1 rounded-full border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-100">
          <LockKeyhole className="h-3.5 w-3.5" />
          已锁帖
        </Badge>
      ) : null}
      {hidden ? (
        <Badge className="gap-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50">
          <EyeOff className="h-3.5 w-3.5" />
          已隐藏
        </Badge>
      ) : null}
    </>
  )
}

export function EducationPageSkeleton({ variant = 'student' }: { variant?: 'courses' | 'student' | 'teacher' }) {
  const cardCount = variant === 'courses' ? 4 : 3

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </div>
      {variant === 'courses' ? <Skeleton className="h-32 rounded-lg" /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="mt-5 h-5 w-2/3" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      {variant === 'teacher' ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-4 h-28 rounded-lg" />
        </div>
      ) : null}
    </div>
  )
}

export function CourseListSkeleton() {
  return <EducationPageSkeleton variant="courses" />
}

export function StatusHeatBadge({ score }: { score: number }) {
  return (
    <Badge className="gap-1 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-white">
      <Flame className="h-3.5 w-3.5 text-orange-500" />
      热度 {score}
    </Badge>
  )
}

export function CourseCoverPreview({ course, caption = 'overlay' }: { course: Course; caption?: CourseCoverCaptionMode }) {
  const uploadedCover = course.coverImageUrl ?? readCourseCover(String(course.id)) ?? readCourseCover(String(course.title))
  const categoryText = String(course.category)
  const titleText = String(course.title).slice(0, 18)
  const coverAspectClass = caption === 'below' ? 'aspect-[16/9]' : 'aspect-[4/3]'

  const captionBelow = caption === 'below' ? (
    <div className="space-y-1 px-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{categoryText}</p>
    </div>
  ) : null

  if (uploadedCover) {
    return (
      <div className={caption === 'below' ? 'space-y-3' : ''}>
        <div className={`relative ${coverAspectClass} w-full overflow-hidden rounded-lg`}>
        <img src={uploadedCover} alt={`${String(course.title)}课程封面`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-white shadow-sm ring-1 ring-white/30">
          <BookOpen className="h-5 w-5" />
        </div>
          {caption === 'overlay' ? (
            <div className="absolute inset-x-5 top-16 text-white">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">{categoryText}</p>
              <p className="mt-1 max-w-[11rem] text-lg font-semibold leading-tight">{titleText}</p>
            </div>
          ) : null}
        </div>
        {captionBelow}
      </div>
    )
  }

  return (
    <div className={caption === 'below' ? 'space-y-3' : ''}>
      <CourseCategoryCover
        category={course.category}
        title={String(course.title)}
        className={`${coverAspectClass} w-full rounded-lg`}
        showText={caption === 'overlay'}
      />
      {captionBelow}
    </div>
  )
}
