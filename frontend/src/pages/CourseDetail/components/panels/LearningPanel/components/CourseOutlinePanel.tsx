import type { Course } from '@/objects/course/catalog/Course'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import { useModuleOutlineState } from '../hooks/useModuleOutlineState'
import CourseLearningPathMap from './CourseLearningPathMap'
import CourseModuleOutlineCard from './CourseModuleOutlineCard'
import CourseOutlineSummary from './CourseOutlineSummary'

type CourseOutlinePanelProps = {
  course: Course
  canStudy: boolean
  focusLessonId?: string
  selectedLessonId?: string
  recentCompletedLessonId?: string | null
  discussionCountByLessonId?: Record<string, number>
  onSelectLesson: (lessonId: string) => void
  onToggleLessonProgress: (lessonId: string, completed: boolean) => Promise<void>
  onOpenLessonDiscussion?: (lessonId: string) => void
}

export default function CourseOutlinePanel({
  course,
  canStudy,
  focusLessonId,
  selectedLessonId,
  recentCompletedLessonId,
  discussionCountByLessonId = {},
  onSelectLesson,
  onToggleLessonProgress,
  onOpenLessonDiscussion,
}: CourseOutlinePanelProps) {
  const {
    openModuleIds,
    totalLessonCount,
    completedLessonCount,
    currentLearningPosition,
    latestStudiedLesson,
    nextLesson,
    toggleModule,
  } = useModuleOutlineState(course, focusLessonId)

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">课程目录与学习进度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <CourseOutlineSummary
          currentLearningPosition={currentLearningPosition}
          nextLesson={nextLesson}
          completedLessonCount={completedLessonCount}
          totalLessonCount={totalLessonCount}
          latestStudiedLesson={latestStudiedLesson}
          recentCompletedLessonId={recentCompletedLessonId}
        />

        <CourseLearningPathMap
          course={course}
          selectedLessonId={selectedLessonId}
          recentCompletedLessonId={recentCompletedLessonId}
          onSelectLesson={onSelectLesson}
        />

        <div className="space-y-4">
          {course.modules.map((module, moduleIndex) => (
            <CourseModuleOutlineCard
              key={module.id}
              course={course}
              module={module}
              moduleIndex={moduleIndex}
              isOpen={openModuleIds.has(String(module.id))}
              canStudy={canStudy}
              focusLessonId={focusLessonId}
              selectedLessonId={selectedLessonId}
              recentCompletedLessonId={recentCompletedLessonId}
              discussionCountByLessonId={discussionCountByLessonId}
              onToggleModule={toggleModule}
              onSelectLesson={onSelectLesson}
              onToggleLessonProgress={onToggleLessonProgress}
              onOpenLessonDiscussion={onOpenLessonDiscussion}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
