// 文件说明：定义业务studentCenter配置领域数据类型，用于业务流程和接口传输。
import type { StudentSection } from '../objects/studentCenterTypes'

export const studentNav = [
  { to: '/student', label: '首页', end: true },
  { to: '/student/courses', label: '课程' },
  { to: '/student/exams', label: '考试' },
  { to: '/student/assignments', label: '作业' },
  { to: '/student/quizzes', label: '测验' },
  { to: '/student/wrongbook', label: '错题本' },
  { to: '/student/grades', label: '成绩' },
  { to: '/student/orders', label: '订单' },
]

export const sectionCopy: Record<StudentSection, { title: string; description: string }> = {
  overview: {
    title: '学生首页',
    description: '今日任务。',
  },
  exams: {
    title: '考试中心',
    description: '考试安排与成绩详情。',
  },
  courses: {
    title: '我的课程',
    description: '已报名课程。',
  },
  assignments: {
    title: '作业',
    description: '作业列表。',
  },
  quizzes: {
    title: '测验',
    description: '测验列表。',
  },
  wrongbook: {
    title: '错题本',
    description: '错题列表。',
  },
  grades: {
    title: '成绩明细',
    description: '成绩列表。',
  },
  orders: {
    title: '订单',
    description: '订单列表。',
  },
}
