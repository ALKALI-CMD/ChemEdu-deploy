// 文件说明：定义课程讨论标记通知Read领域数据类型，用于业务流程和接口传输。
export type MarkNotificationReadData = {
  notificationId?: string
  read: boolean
}
