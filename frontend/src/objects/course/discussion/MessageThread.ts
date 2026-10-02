// 文件说明：定义课程讨论消息Thread领域数据类型，用于业务流程和接口传输。

export type MessageThread = {
  id: string
  from: string
  to: string
  content: string
  attachmentLabel?: string
  sentAt: string
  read: boolean
  category: string
  courseId?: string
}
