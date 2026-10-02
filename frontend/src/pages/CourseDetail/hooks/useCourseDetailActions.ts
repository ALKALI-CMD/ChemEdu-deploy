import type { Course } from '@/objects/course/catalog/Course'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import { LessonProgressStatus } from '@/objects/course/learning/LessonProgressStatus'
import type { NoticeState } from '@/components/ExperienceState'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'

type CourseDetailActionOptions = {
  course?: Course
  dashboardActions: Pick<
    EducationDashboardContextValue,
    'enroll' | 'saveCourse' | 'submitCourseReview' | 'updateCourseStatus' | 'updateLessonProgress'
  >
  setNotice: (notice: NoticeState) => void
  setReviewSubmitting: (submitting: boolean) => void
}

export function useCourseDetailActions({
  course,
  dashboardActions,
  setNotice,
  setReviewSubmitting,
}: CourseDetailActionOptions) {
  const { enroll, saveCourse, submitCourseReview, updateCourseStatus, updateLessonProgress } = dashboardActions

  function requireCourse(): Course {
    if (!course) {
      throw new Error('课程不存在，无法执行当前操作。')
    }
    return course
  }

  async function handleSaveCourse(input: CourseEditorInput) {
    const activeCourse = requireCourse()
    setNotice(null)
    try {
      await saveCourse({
        ...input,
        courseId: activeCourse.id,
        teacherId: input.teacherId ?? activeCourse.teacherId,
      })
      setNotice({
        tone: 'success',
        title: '课程保存成功',
        message: '课程详情、章节和课时信息已经同步更新。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '课程保存失败',
        message: error instanceof Error ? error.message : '保存课程时出现未知错误，请稍后重试。',
      })
    }
  }

  async function handleEnroll(paymentMethod?: Parameters<typeof enroll>[1], inviteCode?: string) {
    const activeCourse = requireCourse()
    try {
      await enroll(activeCourse.id, paymentMethod, inviteCode)
      setNotice({ tone: 'success', title: '报名成功', message: '你已经成功报名这门课程，学生中心和课程详情会同步更新。' })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '报名失败',
        message: error instanceof Error ? error.message : '报名课程时出现未知错误，请稍后重试。',
      })
    }
  }

  async function handleToggleLessonProgress(lessonId: string, completed: boolean) {
    await updateLessonProgress(lessonId, completed ? LessonProgressStatus.Incomplete : LessonProgressStatus.Completed)
  }

  async function handleRecordLessonStudy(
    lessonId: string,
    completed: boolean,
    studyMinutes: number,
    lastPositionSeconds?: number,
    options?: {
      silent?: boolean
      completedPreviewResourceIds?: string[]
      playbackRate?: number
      eventType?: string
    },
  ) {
    try {
      await updateLessonProgress(
        lessonId,
        completed ? LessonProgressStatus.Completed : LessonProgressStatus.Incomplete,
        studyMinutes,
        lastPositionSeconds,
        options?.completedPreviewResourceIds,
        options?.playbackRate,
        options?.eventType,
      )
      if (!options?.silent && studyMinutes > 0) {
        setNotice({
          tone: 'success',
          title: '学习记录已更新',
          message: `已为当前课时累计 ${studyMinutes} 分钟学习时长，并同步最近学习位置。`,
        })
      }
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '学习记录更新失败',
        message: error instanceof Error ? error.message : '记录学习进度时出现未知错误，请稍后重试。',
      })
    }
  }

  async function handleSubmitCourseReview(rating: number, content: string) {
    const activeCourse = requireCourse()
    setNotice(null)
    setReviewSubmitting(true)
    try {
      await submitCourseReview(activeCourse.id, rating, content)
      setNotice({
        tone: 'success',
        title: '评价已保存',
        message: '课程评分与评价已更新。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '评价提交失败',
        message: error instanceof Error ? error.message : '提交课程评价时出现未知错误。',
      })
    } finally {
      setReviewSubmitting(false)
    }
  }

  return {
    handleEnroll,
    handleRecordLessonStudy,
    handleSaveCourse,
    handleSubmitCourseReview,
    handleToggleLessonProgress,
    handleUpdateCourseStatus: updateCourseStatus,
  }
}
