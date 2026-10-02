// 文件说明：定义课程讨论平台举报变更接口响应类型，用于前后端 API 返回值约束。
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'

export type PlatformReportMutationResponse = {
  message: string
  report: PlatformReport
}
