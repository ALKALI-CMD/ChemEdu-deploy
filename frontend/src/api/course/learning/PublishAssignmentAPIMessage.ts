// 文件说明：前端学习接口封装，用于发起发布作业请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentRubricCriterion } from '@/objects/course/learning/AssignmentRubricCriterion'

export type PublishAssignmentPayload = {
  courseId: string
  title: string
  description: string
  deadline: string
  attachmentLabel: string
  maxAttempts?: number
  allowLateSubmission?: boolean
  allowResubmission?: boolean
  allowMakeUpSubmission?: boolean
  lateSubmissionDeadline?: string
  latePenaltyPercentPerDay?: number
  latePenaltyCapPercent?: number
  rubric?: AssignmentRubricCriterion[]
  referenceAttachments?: AssignmentAttachment[]
}

export type PublishAssignmentRequestPayload = PublishAssignmentPayload & {
  sessionToken: SessionToken
}

export function createPublishAssignmentRequest(
  sessionToken: SessionToken,
  input: PublishAssignmentPayload,
): ApiRequest<PublishAssignmentRequestPayload, Assignment> {
  return {
    name: 'PublishAssignmentAPIMessage',
    method: 'POST',
    path: `/api/v1/courses/${input.courseId}/assignments`,
    payload: { sessionToken, ...input },
    parseResponse: parseEntityResponse<'assignment', Assignment>('assignment'),
  }
}
