import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

import { buildStudentCenterModel } from '../functions/studentCenterModelBuilders'

export type {
  ContinueLearningItem,
  GradeDetailItem,
  GradeTrendPoint,
  LatestScoreItem,
  StudentSection,
  TimelineItem,
  WrongQuestionItem,
} from '../objects/studentCenterTypes'

export function useStudentCenterModel(dashboard: EducationDashboardResponse) {
  return buildStudentCenterModel(dashboard)
}
