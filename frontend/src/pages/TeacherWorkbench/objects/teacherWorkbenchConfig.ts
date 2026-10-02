// 文件说明：定义业务teacherWorkbench配置领域数据类型，用于业务流程和接口传输。
type TeacherWorkbenchSection =
  | 'overview'
  | 'exams'
  | 'grading'
  | 'courses'
  | 'publishing'
  | 'reviews'
  | 'discussions'
  | 'gradebook'

const teacherNav = [
  { to: '/teacher', label: '首页', end: true },
  { to: '/teacher/exams', label: '考试管理' },
  { to: '/teacher/grading', label: '阅卷' },
  { to: '/teacher/courses', label: '课程' },
  { to: '/teacher/publishing', label: '发布' },
  { to: '/teacher/reviews', label: '批改' },
  { to: '/teacher/gradebook', label: '成绩册' },
  { to: '/teacher/discussions', label: '讨论' },
]

const sectionCopy: Record<TeacherWorkbenchSection, { title: string; description: string }> = {
  overview: {
    title: '教研工作台',
    description: '教学与考试概览。',
  },
  exams: {
    title: '考试管理',
    description: '期次、试卷与争分复核。',
  },
  grading: {
    title: '阅卷中心',
    description: '答题卡上传与逐题判分。',
  },
  courses: {
    title: '课程',
    description: '课程管理。',
  },
  publishing: {
    title: '发布',
    description: '发布作业和测验。',
  },
  reviews: {
    title: '批改',
    description: '提交列表。',
  },
  gradebook: {
    title: '成绩册',
    description: '课程成绩与考试折合分。',
  },
  discussions: {
    title: '讨论',
    description: '讨论列表。',
  },
}

export { sectionCopy, teacherNav }
export type { TeacherWorkbenchSection }
