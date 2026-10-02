// 文件说明：定义课程讨论通知Item领域数据类型，用于业务流程和接口传输。

export type NotificationItem = {
  id: string
  userId: string
  courseId?: string
  category: string
  title: string
  content: string
  read: boolean
  createdAt: string
  actionUrl?: string
}
