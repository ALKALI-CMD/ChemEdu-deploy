// 文件说明：定义课程讨论创建讨论Topic领域数据类型，用于业务流程和接口传输。

export type CreateDiscussionTopicData = {
  courseId: string
  lessonId?: string
  title: string
  content: string
}
