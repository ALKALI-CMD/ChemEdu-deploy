// 文件说明：前端学习接口封装，用于发起评价/批改作业请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentRubricScore } from '@/objects/course/learning/AssignmentRubricScore'
import type { TeacherAnnotation } from '@/objects/course/learning/TeacherAnnotation'

export type ReviewAssignmentPayload = {
  sessionToken: SessionToken
  assignmentId: string
  score: number
  feedback: string
  reviewAttachments: AssignmentAttachment[]
  rubricScores: AssignmentRubricScore[]
  teacherAnnotations: TeacherAnnotation[]
}

export function createReviewAssignmentRequest(
  sessionToken: SessionToken,
  assignmentId: string,
  score: number,
  feedback: string,
  reviewAttachments: AssignmentAttachment[],
  rubricScores: AssignmentRubricScore[] = [],
  teacherAnnotations: TeacherAnnotation[] = [],
): ApiRequest<ReviewAssignmentPayload, Assignment> {
  return {
    name: 'ReviewAssignmentAPIMessage',
    method: 'POST',
    path: `/api/v1/assignments/${assignmentId}/reviews`,
    payload: {
      sessionToken,
      assignmentId,
      score,
      feedback,
      reviewAttachments,
      rubricScores,
      teacherAnnotations,
    },
    parseResponse: parseEntityResponse<'assignment', Assignment>('assignment'),
  }
}
