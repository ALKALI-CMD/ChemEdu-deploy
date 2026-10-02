// 文件说明：定义学习课时Study时间线Entry领域数据类型，用于业务流程和接口传输。

export type LessonStudyTimelineEntry = {
  id: string
  eventType: string
  studyMinutesDelta: number
  lastPositionSeconds: number
  recordedAt: string
}
