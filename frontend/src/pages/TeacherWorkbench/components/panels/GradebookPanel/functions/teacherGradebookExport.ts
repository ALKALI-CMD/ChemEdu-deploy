import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import { downloadCsv } from './gradebookUtils'

type GradeDistribution = {
  courseTitle: string
  studentCount: number
  averageScore: number
  passRate: string
  excellentRate: string
  failCount: number
  passCount: number
  goodCount: number
  excellentCount: number
}

type ClassGradeDistribution = GradeDistribution & {
  academicClassName: string
}

export function exportTeacherGradebook(input: {
  gradebookEntries: GradebookEntry[]
  courseProgressEntries: CourseProgressStats[]
  courseTitleMap: Map<string, string>
  courseGradeDistributions: GradeDistribution[]
  classGradeDistributions: ClassGradeDistribution[]
}) {
  downloadCsv('teacher-gradebook.csv', [
    ['课程', '作业均分', '测验均分', '进度得分', '课程总评', '权重口径', '任务完成率', '已完成课时', '总课时', '学习分钟数', '课程进度'],
    ...input.gradebookEntries.map((entry) => {
      const progress = input.courseProgressEntries.find((item) => item.courseId === entry.courseId)
      return [
        input.courseTitleMap.get(entry.courseId) ?? String(entry.courseId),
        entry.assignmentAverage,
        entry.quizAverage,
        entry.progressScore,
        entry.totalScore,
        `作业${entry.assignmentWeight}% / 测验${entry.quizWeight}% / 进度${entry.progressWeight}%`,
        entry.completedTaskRate,
        progress?.completedLessons ?? 0,
        progress?.totalLessons ?? 0,
        progress?.studyMinutes ?? 0,
        `${progress?.completionRate ?? 0}%`,
      ].map(String)
    }),
  ])

  downloadCsv('teacher-grade-distributions.csv', [
    ['课程', '人数', '平均分', '及格率', '优秀率', '不及格', '及格', '良好', '优秀'],
    ...input.courseGradeDistributions.map((entry) => [
      entry.courseTitle,
      String(entry.studentCount),
      String(entry.averageScore),
      String(entry.passRate),
      String(entry.excellentRate),
      String(entry.failCount),
      String(entry.passCount),
      String(entry.goodCount),
      String(entry.excellentCount),
    ]),
    [],
    ['课程', '班级', '人数', '平均分', '及格率', '优秀率', '不及格', '及格', '良好', '优秀'],
    ...input.classGradeDistributions.map((entry) => [
      entry.courseTitle,
      entry.academicClassName,
      String(entry.studentCount),
      String(entry.averageScore),
      String(entry.passRate),
      String(entry.excellentRate),
      String(entry.failCount),
      String(entry.passCount),
      String(entry.goodCount),
      String(entry.excellentCount),
    ]),
  ])
}
