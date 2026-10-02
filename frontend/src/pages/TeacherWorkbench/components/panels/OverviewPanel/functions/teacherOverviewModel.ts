export type DrilldownKey = 'risk' | 'bottleneck' | 'hotspot'

export function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export function buildLessonLink(courseId: string, lessonId: string) {
  return `/course/${courseId}?lesson=${lessonId}`
}
