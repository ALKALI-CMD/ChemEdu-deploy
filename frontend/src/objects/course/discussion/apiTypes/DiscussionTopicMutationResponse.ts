// 文件说明：定义课程讨论讨论Topic变更接口响应类型，用于前后端 API 返回值约束。
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

export type DiscussionTopicMutationResponse = {
  message: string
  discussion: DiscussionTopic
}
