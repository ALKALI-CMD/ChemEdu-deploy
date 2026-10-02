// 文件说明：定义课程讨论讨论ThreadState领域数据类型，用于业务流程和接口传输。
export const DiscussionThreadState = {
  Open: 'open',
  Locked: 'locked',
} as const

export type DiscussionThreadState = typeof DiscussionThreadState[keyof typeof DiscussionThreadState]
