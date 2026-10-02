// 文件说明：前端学习接口封装，用于发起提交作业请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'

export type SubmitAssignmentPayload = {
  sessionToken: SessionToken
  assignmentId: string
  submissionContent: string
  submissionAttachments: AssignmentAttachment[]
  submissionNote?: string
}

export function createSubmitAssignmentRequest(
  sessionToken: SessionToken,
  assignmentId: string,
  submissionContent: string,
  submissionAttachments: AssignmentAttachment[],
  submissionNote?: string,
): ApiRequest<SubmitAssignmentPayload, Assignment> {
  return {
    name: 'SubmitAssignmentAPIMessage',
    method: 'POST',
    path: `/api/v1/assignments/${assignmentId}/submissions`,
    payload: {
      sessionToken,
      assignmentId,
      submissionContent,
      submissionAttachments,
      submissionNote,
    },
    parseResponse: parseEntityResponse<'assignment', Assignment>('assignment'),
  }
}
