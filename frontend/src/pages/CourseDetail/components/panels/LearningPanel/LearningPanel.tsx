import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/UiComponents'
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'
import CourseAssessmentsPanel from './components/CourseAssessmentsPanel'
import CourseHero from './components/CourseHero'
import CourseMetaPanel from './components/CourseMetaPanel'
import CourseReviewsPanel from './components/CourseReviewsPanel'
import ContinueLearningPanel from './components/ContinueLearningPanel'
import ModuleProgressPanel from './components/ModuleProgressPanel'

type LearningPanelProps = {
  course: Course
  assignments: Assignment[]
  quizzes: Quiz[]
  reviews: CourseReview[]
  enrolled: boolean
  canManage: boolean
  canStudy: boolean
  currentUserId: UserId
  currentRole: UserRole
  teacherName: string
  assistantNames: string
  focusLessonId?: string
  discussionCountByLessonId: Record<string, number>
  reviewSubmitting: boolean
  onEnroll: Parameters<typeof CourseHero>[0]['onEnroll']
  onReport: (targetType: string, targetId: string, targetLabel: string, reason: string, detail?: string) => ReturnType<Parameters<typeof CourseHero>[0]['onReport']>
  onToggleLessonProgress: (lessonId: string, completed: boolean) => Promise<void>
  onRecordLessonStudy: Parameters<typeof ModuleProgressPanel>[0]['onRecordLessonStudy']
  onOpenLessonDiscussion: (lessonId: string) => void
  onSubmitReview: (rating: number, content: string) => Promise<void>
}

export default function LearningPanel({
  course,
  assignments,
  quizzes,
  reviews,
  enrolled,
  canManage,
  canStudy,
  currentUserId,
  currentRole,
  teacherName,
  assistantNames,
  focusLessonId,
  discussionCountByLessonId,
  reviewSubmitting,
  onEnroll,
  onReport,
  onToggleLessonProgress,
  onRecordLessonStudy,
  onOpenLessonDiscussion,
  onSubmitReview,
}: LearningPanelProps) {
  return (
    <>
      <CourseHero
        course={course}
        enrolled={enrolled}
        currentUserId={String(currentUserId)}
        currentRole={currentRole}
        onReport={onReport}
        onEnroll={onEnroll}
      />

      <ContinueLearningPanel courseId={String(course.id)} canManage={canManage} />

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-slate-100 p-2">
          <TabsTrigger value="catalog" className="rounded-xl px-4 py-2 data-[state=active]:bg-white">课程目录</TabsTrigger>
          <TabsTrigger value="assessments" className="rounded-xl px-4 py-2 data-[state=active]:bg-white">作业与测验</TabsTrigger>
          <TabsTrigger value="meta" className="rounded-xl px-4 py-2 data-[state=active]:bg-white">课程信息</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-xl px-4 py-2 data-[state=active]:bg-white">课程评价</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-0">
          <ModuleProgressPanel
            course={course}
            canStudy={canStudy}
            focusLessonId={focusLessonId}
            discussionCountByLessonId={discussionCountByLessonId}
            onToggleLessonProgress={onToggleLessonProgress}
            onRecordLessonStudy={onRecordLessonStudy}
            onOpenLessonDiscussion={onOpenLessonDiscussion}
          />
        </TabsContent>
        <TabsContent value="assessments" className="mt-0">
          <CourseAssessmentsPanel assignments={assignments} quizzes={quizzes} />
        </TabsContent>
        <TabsContent value="meta" className="mt-0">
          <CourseMetaPanel course={course} enrolled={enrolled} teacherName={teacherName} assistantNames={assistantNames} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-0">
          <CourseReviewsPanel
            reviews={reviews}
            currentUserId={currentUserId}
            canSubmit={canStudy}
            submitting={reviewSubmitting}
            onSubmit={onSubmitReview}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
